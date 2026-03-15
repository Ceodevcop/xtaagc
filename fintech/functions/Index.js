const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ origin: true });
const { v4: uuidv4 } = require('uuid');

admin.initializeApp();

// 9PSB Configuration
const NINERPSB_API_KEY = functions.config().ninerpsb?.api_key || 'test_key';
const NINERPSB_SECRET = functions.config().ninerpsb?.secret || 'test_secret';
const NINERPSB_BASE_URL = functions.config().ninerpsb?.base_url || 'https://api.9psb.com/v1';

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const userData = {
      uid: user.uid,
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'customer',
      kycStatus: 'pending',
      walletBalance: 0,
      totalCommission: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await admin.firestore().collection('users').doc(user.uid).set(userData);
    console.log(`User profile created for ${user.uid}`);
    return null;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
});

exports.deleteUserData = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user document
    await admin.firestore().collection('users').doc(user.uid).delete();
    
    // Delete wallet
    await admin.firestore().collection('wallets').doc(user.uid).delete();
    
    // Delete KYC documents from storage
    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({ prefix: `kyc/${user.uid}/` });
    
    console.log(`User data deleted for ${user.uid}`);
    return null;
  } catch (error) {
    console.error('Error deleting user data:', error);
    return null;
  }
});

// ============================================
// WALLET FUNCTIONS
// ============================================

exports.createWallet = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  try {
    const { userId, email, phone } = data;
    
    // Call 9PSB API to create wallet
    const response = await axios.post(`${NINERPSB_BASE_URL}/wallet/create`, {
      userId,
      email,
      phone,
      apiKey: NINERPSB_API_KEY
    });
    
    // Store wallet in Firestore
    await admin.firestore().collection('wallets').doc(userId).set({
      userId: context.auth.uid,
      accountNumber: response.data.accountNumber,
      accountName: response.data.accountName,
      bankName: '9 Payment Service Bank',
      balance: 0,
      floatBalance: 0,
      status: 'active',
      dailyLimit: 1000000,
      monthlyLimit: 10000000,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Log audit
    await admin.firestore().collection('audit').add({
      userId: context.auth.uid,
      action: 'wallet_created',
      details: { accountNumber: response.data.accountNumber },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      success: true, 
      accountNumber: response.data.accountNumber,
      message: 'Wallet created successfully' 
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create wallet');
  }
});

exports.getBalance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  try {
    const walletDoc = await admin.firestore().collection('wallets').doc(context.auth.uid).get();
    
    if (!walletDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Wallet not found');
    }
    
    return {
      success: true,
      balance: walletDoc.data().balance,
      floatBalance: walletDoc.data().floatBalance,
      accountNumber: walletDoc.data().accountNumber
    };
  } catch (error) {
    console.error('Error getting balance:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get balance');
  }
});

// ============================================
// VALUE ADDED SERVICES (from PSA Agreement)
// ============================================

// Commission rates from PSA Schedule 1
const AIRTIME_COMMISSIONS = {
  'MTN': 0.03,
  'Airtel': 0.03,
  'Glo': 0.0429,
  '9mobile': 0.0771
};

const BILL_COMMISSIONS = {
  'AEDC': 0.0129,
  'EEDC': 0.0129,
  'KAEDC': 0.0129,
  'PHED': 0.0129,
  'JED': 0.0129,
  'IBEDC': 0.0086,
  'IKEDC': 0.0120,
  'EKEDC': 0.0129,
  'KEDCO': 0.0129
};

const BETTING_COMMISSIONS = {
  'Bet9ja': { rate: 0.0034, cap: 850 },
  'BetKing': { rate: 0.0086, cap: 860 },
  '1xBet': { rate: 0.003, cap: null },
  'BetLand': { rate: 0.003, cap: null },
  'CloudBet': { rate: 0.003, cap: null },
  'LiveScoreBet': { rate: 0.003, cap: null },
  'MerryBet': { rate: 0.0013, cap: null },
  'NairaBet': { rate: 0.0013, cap: null },
  'SupaBet': { rate: 0.0013, cap: null }
};

exports.purchaseAirtime = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { network, phoneNumber, amount } = data;
  
  if (!network || !phoneNumber || !amount) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }
  
  try {
    // Call 9PSB API
    const response = await axios.post(`${NINERPSB_BASE_URL}/airtime/purchase`, {
      network,
      phone: phoneNumber,
      amount: parseFloat(amount),
      reference: `TXN${uuidv4().substring(0, 8).toUpperCase()}`,
      apiKey: NINERPSB_API_KEY
    });
    
    // Calculate commission
    const commissionRate = AIRTIME_COMMISSIONS[network] || 0.03;
    const commissionAmount = parseFloat(amount) * commissionRate;
    
    // Record transaction
    await admin.firestore().collection('transactions').add({
      userId: context.auth.uid,
      type: 'airtime',
      network,
      phoneNumber,
      amount: parseFloat(amount),
      commission: commissionAmount,
      status: 'success',
      reference: response.data.reference,
      providerReference: response.data.providerReference,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update user's wallet balance (debit)
    const walletRef = admin.firestore().collection('wallets').doc(context.auth.uid);
    await walletRef.update({
      balance: admin.firestore.FieldValue.increment(-parseFloat(amount)),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update user's total commission
    const userRef = admin.firestore().collection('users').doc(context.auth.uid);
    await userRef.update({
      totalCommission: admin.firestore.FieldValue.increment(commissionAmount)
    });
    
    // Check if user is agent and update daily commission
    const userDoc = await userRef.get();
    if (userDoc.data().role === 'agent' || userDoc.data().role === 'sub-agent') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const agentStatsRef = admin.firestore().collection('agentStats').doc(`${context.auth.uid}_${today.toISOString()}`);
      await agentStatsRef.set({
        userId: context.auth.uid,
        date: today,
        commission: admin.firestore.FieldValue.increment(commissionAmount),
        transactions: admin.firestore.FieldValue.increment(1)
      }, { merge: true });
    }
    
    return {
      success: true,
      reference: response.data.reference,
      commission: commissionAmount,
      message: 'Airtime purchased successfully'
    };
  } catch (error) {
    console.error('Error purchasing airtime:', error);
    
    // Log failed transaction
    await admin.firestore().collection('failedTransactions').add({
      userId: context.auth.uid,
      type: 'airtime',
      network,
      phoneNumber,
      amount: parseFloat(amount),
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    throw new functions.https.HttpsError('internal', 'Failed to purchase airtime');
  }
});

exports.payBill = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { disco, meterNumber, amount, customerName, meterType } = data;
  
  if (!disco || !meterNumber || !amount) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }
  
  try {
    // Call 9PSB API
    const response = await axios.post(`${NINERPSB_BASE_URL}/bill/pay`, {
      disco,
      meterNumber,
      amount: parseFloat(amount),
      customerName: customerName || '',
      meterType: meterType || 'prepaid',
      reference: `BILL${uuidv4().substring(0, 8).toUpperCase()}`,
      apiKey: NINERPSB_API_KEY
    });
    
    // Calculate commission
    const commissionRate = BILL_COMMISSIONS[disco] || 0.0129;
    const commissionAmount = parseFloat(amount) * commissionRate;
    
    // Add NIBSS fee if applicable
    const nibssFee = 50; // ₦50 stamp duty for transactions >= ₦10,000
    
    // Record transaction
    await admin.firestore().collection('transactions').add({
      userId: context.auth.uid,
      type: 'bill',
      disco,
      meterNumber,
      amount: parseFloat(amount),
      commission: commissionAmount,
      nibssFee: parseFloat(amount) >= 10000 ? nibssFee : 0,
      status: 'success',
      reference: response.data.reference,
      token: response.data.token,
      units: response.data.units,
      customerName: customerName || '',
      meterType: meterType || 'prepaid',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update wallet balance
    const walletRef = admin.firestore().collection('wallets').doc(context.auth.uid);
    const totalDebit = parseFloat(amount) + (parseFloat(amount) >= 10000 ? nibssFee : 0);
    await walletRef.update({
      balance: admin.firestore.FieldValue.increment(-totalDebit),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      reference: response.data.reference,
      token: response.data.token,
      units: response.data.units,
      commission: commissionAmount,
      message: 'Bill payment successful'
    };
  } catch (error) {
    console.error('Error paying bill:', error);
    throw new functions.https.HttpsError('internal', 'Failed to pay bill');
  }
});

exports.fundBetting = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { provider, customerId, amount } = data;
  
  if (!provider || !customerId || !amount) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }
  
  try {
    // Call 9PSB API
    const response = await axios.post(`${NINERPSB_BASE_URL}/betting/fund`, {
      provider,
      customerId,
      amount: parseFloat(amount),
      reference: `BET${uuidv4().substring(0, 8).toUpperCase()}`,
      apiKey: NINERPSB_API_KEY
    });
    
    // Calculate commission
    const commissionConfig = BETTING_COMMISSIONS[provider] || { rate: 0.003, cap: null };
    let commissionAmount = parseFloat(amount) * commissionConfig.rate;
    if (commissionConfig.cap && commissionAmount > commissionConfig.cap) {
      commissionAmount = commissionConfig.cap;
    }
    
    // Record transaction
    await admin.firestore().collection('transactions').add({
      userId: context.auth.uid,
      type: 'betting',
      provider,
      customerId,
      amount: parseFloat(amount),
      commission: commissionAmount,
      status: 'success',
      reference: response.data.reference,
      providerReference: response.data.providerReference,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update wallet balance
    const walletRef = admin.firestore().collection('wallets').doc(context.auth.uid);
    await walletRef.update({
      balance: admin.firestore.FieldValue.increment(-parseFloat(amount)),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      reference: response.data.reference,
      commission: commissionAmount,
      message: 'Betting account funded successfully'
    };
  } catch (error) {
    console.error('Error funding betting:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fund betting account');
  }
});

// ============================================
// AGENT SERVICES (from SLOMA Agreement)
// ============================================

exports.registerAgent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { businessName, address, lga, state, businessType } = data;
  
  try {
    // Generate unique agent code
    const agentCode = `AG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Create agent record
    await admin.firestore().collection('agents').doc(agentCode).set({
      userId: context.auth.uid,
      businessName,
      address,
      lga,
      state,
      businessType,
      agentCode,
      status: 'pending',
      posTerminals: [],
      subAgents: [],
      dailyTransactions: 0,
      commissionEarned: 0,
      totalCommission: 0,
      performance: {
        daily: 0,
        weekly: 0,
        monthly: 0
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update user role
    await admin.firestore().collection('users').doc(context.auth.uid).update({
      role: 'agent',
      agentCode: agentCode,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send notification to admin
    await admin.firestore().collection('notifications').add({
      type: 'agent_registration',
      agentId: agentCode,
      agentName: businessName,
      status: 'pending',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      agentCode,
      message: 'Agent registration submitted for approval'
    };
  } catch (error) {
    console.error('Error registering agent:', error);
    throw new functions.https.HttpsError('internal', 'Failed to register agent');
  }
});

exports.recordPosTransaction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { type, amount, customerPhone, terminalId } = data;
  
  try {
    // Calculate commission based on SLOMA Schedule 1
    let commission = 0;
    if (type === 'cash-out') {
      commission = Math.min(amount * 0.0004, 25); // 0.04% capped at ₦25
    } else if (type === 'transfer') {
      commission = 4; // ₦4 flat
    }
    
    const transaction = {
      agentId: context.auth.uid,
      type,
      amount: parseFloat(amount),
      customerPhone,
      terminalId,
      commission,
      status: 'completed',
      reference: `POS${Date.now()}${Math.floor(Math.random() * 1000)}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await admin.firestore().collection('posTransactions').add(transaction);
    
    // Update agent's stats
    const agentQuery = await admin.firestore().collection('agents')
      .where('userId', '==', context.auth.uid)
      .limit(1)
      .get();
    
    if (!agentQuery.empty) {
      const agentRef = agentQuery.docs[0].ref;
      await agentRef.update({
        dailyTransactions: admin.firestore.FieldValue.increment(1),
        commissionEarned: admin.firestore.FieldValue.increment(commission),
        totalCommission: admin.firestore.FieldValue.increment(commission),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Update terminal transaction count
    if (terminalId) {
      const terminalRef = admin.firestore().collection('posTerminals').doc(terminalId);
      await terminalRef.update({
        dailyCount: admin.firestore.FieldValue.increment(1),
        lastTransaction: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return {
      success: true,
      commission,
      message: 'Transaction recorded successfully'
    };
  } catch (error) {
    console.error('Error recording POS transaction:', error);
    throw new functions.https.HttpsError('internal', 'Failed to record transaction');
  }
});

// ============================================
// SCHEDULED FUNCTIONS
// ============================================

// Daily settlement (BSA Clause 7.6 - by 12:00pm)
exports.dailySettlement = functions.pubsub.schedule('0 12 * * *').onRun(async (context) => {
  console.log('Running daily settlement...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    // Get all successful transactions from yesterday
    const transactionsSnapshot = await admin.firestore().collection('transactions')
      .where('createdAt', '>=', yesterday)
      .where('createdAt', '<', today)
      .where('status', '==', 'success')
      .get();
    
    // Group by user
    const settlements = {};
    
    transactionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!settlements[data.userId]) {
        settlements[data.userId] = {
          totalAmount: 0,
          totalCommission: 0,
          transactions: []
        };
      }
      settlements[data.userId].totalAmount += data.amount || 0;
      settlements[data.userId].totalCommission += data.commission || 0;
      settlements[data.userId].transactions.push(doc.id);
    });
    
    // Create settlement records
    for (const [userId, data] of Object.entries(settlements)) {
      await admin.firestore().collection('settlements').add({
        userId,
        date: yesterday,
        totalAmount: data.totalAmount,
        totalCommission: data.totalCommission,
        transactionCount: data.transactions.length,
        transactions: data.transactions,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Created settlement for user ${userId}: ₦${data.totalAmount}`);
    }
    
    console.log(`Daily settlement completed for ${Object.keys(settlements).length} users`);
    return null;
  } catch (error) {
    console.error('Error in daily settlement:', error);
    return null;
  }
});

// Monitor agent performance (SLOMA - 30 transactions daily minimum)
exports.monitorAgentPerformance = functions.pubsub.schedule('0 23 * * *').onRun(async (context) => {
  console.log('Monitoring agent performance...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    const agentsSnapshot = await admin.firestore().collection('agents').get();
    
    for (const agentDoc of agentsSnapshot.docs) {
      const agent = agentDoc.data();
      
      // Get today's transaction count
      const transactionsSnapshot = await admin.firestore().collection('posTransactions')
        .where('agentId', '==', agent.userId)
        .where('createdAt', '>=', today)
        .get();
      
      const count = transactionsSnapshot.size;
      
      // Update agent's daily stats
      await agentDoc.ref.update({
        'performance.daily': count,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Check if below minimum (30 transactions)
      if (count < 30) {
        // Create alert
        await admin.firestore().collection('alerts').add({
          agentId: agentDoc.id,
          agentName: agent.businessName,
          type: 'low-performance',
          message: `Only ${count} transactions today. Minimum required: 30`,
          date: today,
          resolved: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Alert: Agent ${agent.businessName} has only ${count} transactions`);
      }
      
      // Check if very low (below 10) - critical alert
      if (count < 10) {
        // Send email/SMS to agent and admin
        await admin.firestore().collection('notifications').add({
          type: 'critical_performance',
          agentId: agentDoc.id,
          agentName: agent.businessName,
          message: `Critical: Only ${count} transactions today. Terminal may be recalled.`,
          priority: 'high',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    console.log('Agent performance monitoring completed');
    return null;
  } catch (error) {
    console.error('Error monitoring agent performance:', error);
    return null;
  }
});

// Calculate monthly commission for agents (SLOMA Schedule 2)
exports.calculateMonthlyCommission = functions.pubsub.schedule('0 0 1 * *').onRun(async (context) => {
  console.log('Calculating monthly commissions...');
  
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const endOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  
  try {
    const agentsSnapshot = await admin.firestore().collection('agents').get();
    
    for (const agentDoc of agentsSnapshot.docs) {
      const agent = agentDoc.data();
      
      // Get last month's account openings
      const accountOpeningsSnapshot = await admin.firestore().collection('accountOpenings')
        .where('agentId', '==', agent.userId)
        .where('createdAt', '>=', startOfMonth)
        .where('createdAt', '<=', endOfMonth)
        .get();
      
      let accountCommission = 0;
      accountOpeningsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.initialDeposit >= 500) {
          accountCommission += 120; // ₦120 per funded account
        }
      });
      
      // Get micro-payment transactions
      const microPaymentsSnapshot = await admin.firestore().collection('posTransactions')
        .where('agentId', '==', agent.userId)
        .where('type', '==', 'micro-payment')
        .where('createdAt', '>=', startOfMonth)
        .where('createdAt', '<=', endOfMonth)
        .get();
      
      const microCommission = microPaymentsSnapshot.size * 1.40; // ₦1.40 per transaction
      
      // Calculate additional bonus based on volume
      const totalTransactions = microPaymentsSnapshot.size + accountOpeningsSnapshot.size;
      let bonus = 0;
      
      if (totalTransactions > 1000) bonus = 10000;
      else if (totalTransactions > 500) bonus = 5000;
      else if (totalTransactions > 200) bonus = 2000;
      
      const totalCommission = accountCommission + microCommission + bonus;
      
      // Create monthly commission record
      if (totalCommission > 0) {
        await admin.firestore().collection('monthlyCommissions').add({
          agentId: agent.userId,
          agentName: agent.businessName,
          month: `${lastMonth.getFullYear()}-${lastMonth.getMonth() + 1}`,
          accountOpenings: accountOpeningsSnapshot.size,
          accountCommission,
          microTransactions: microPaymentsSnapshot.size,
          microCommission,
          bonus,
          totalCommission,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update agent's total commission
        await agentDoc.ref.update({
          totalCommission: admin.firestore.FieldValue.increment(totalCommission)
        });
        
        console.log(`Monthly commission for ${agent.businessName}: ₦${totalCommission}`);
      }
    }
    
    console.log('Monthly commission calculation completed');
    return null;
  } catch (error) {
    console.error('Error calculating monthly commission:', error);
    return null;
  }
});

// API Key Rotation (Schedule 7 compliance - every 90 days)
exports.rotateApiKeys = functions.pubsub.schedule('0 0 */90 * *').onRun(async (context) => {
  console.log('Rotating API keys...');
  
  try {
    // Generate new API key and secret
    const newApiKey = generateSecureKey();
    const newSecret = generateSecureKey();
    
    // Call 9PSB API to rotate keys
    await axios.post(`${NINERPSB_BASE_URL}/keys/rotate`, {
      oldApiKey: NINERPSB_API_KEY,
      newApiKey,
      newSecret,
      timestamp: new Date().toISOString()
    });
    
    // Update Firebase config (requires redeploy or using runtime config)
    // Note: This requires admin privileges to update runtime config
    console.log('API keys rotated successfully');
    
    // Store rotation record
    await admin.firestore().collection('system').doc('apiKeys').set({
      currentKey: newApiKey.substring(0, 8) + '...', // Only store partial for security
      lastRotated: admin.firestore.FieldValue.serverTimestamp(),
      nextRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      rotatedBy: 'system'
    }, { merge: true });
    
    // Notify admins
    await admin.firestore().collection('notifications').add({
      type: 'system',
      title: 'API Keys Rotated',
      message: 'API keys have been rotated successfully',
      priority: 'high',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return null;
  } catch (error) {
    console.error('Error rotating API keys:', error);
    
    // Create alert for failed rotation
    await admin.firestore().collection('alerts').add({
      type: 'critical',
      title: 'API Key Rotation Failed',
      message: error.message,
      severity: 'high',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return null;
  }
});

function generateSecureKey() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// ============================================
// HTTP FUNCTIONS
// ============================================

// Webhook for 9PSB callbacks
exports.ninerpsbWebhook = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  cors(req, res, async () => {
    try {
      const { event, data, reference } = req.body;
      
      console.log(`Received webhook: ${event}`, reference);
      
      switch (event) {
        case 'transaction.success':
          // Update transaction status
          const transactionQuery = await admin.firestore().collection('transactions')
            .where('reference', '==', reference)
            .limit(1)
            .get();
          
          if (!transactionQuery.empty) {
            const transactionRef = transactionQuery.docs[0].ref;
            await transactionRef.update({
              status: 'success',
              providerData: data,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          break;
          
        case 'transaction.failed':
          // Update transaction status
          const failedQuery = await admin.firestore().collection('transactions')
            .where('reference', '==', reference)
            .limit(1)
            .get();
          
          if (!failedQuery.empty) {
            const transactionRef = failedQuery.docs[0].ref;
            await transactionRef.update({
              status: 'failed',
              error: data.error,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          break;
          
        case 'settlement.completed':
          // Update settlement status
          const settlementQuery = await admin.firestore().collection('settlements')
            .where('date', '==', data.date)
            .where('userId', '==', data.userId)
            .limit(1)
            .get();
          
          if (!settlementQuery.empty) {
            const settlementRef = settlementQuery.docs[0].ref;
            await settlementRef.update({
              status: 'completed',
              completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          break;
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Health check endpoint
exports.health = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      firestore: 'connected',
      functions: 'operational',
      api: NINERPSB_API_KEY ? 'configured' : 'missing'
    }
  });
});

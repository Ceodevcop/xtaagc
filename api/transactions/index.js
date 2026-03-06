// api/transactions/index.js
import admin, { db, isAdmin, verifyToken } from '../lib/firebase-admin.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, transactionId } = req.query;

  if (!action) {
    return res.status(200).json({
      name: "TAAGC Transactions API",
      endpoints: {
        list: "GET /api/transactions?action=list",
        create: "POST /api/transactions?action=create",
        get: "GET /api/transactions?action=get&transactionId={id}",
        stats: "GET /api/transactions?action=stats"
      }
    });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  const tokenResult = await verifyToken(token);

  if (!tokenResult.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const callerUid = tokenResult.decoded.uid;
  const callerIsAdmin = await isAdmin(callerUid);

  try {
    switch (action) {
      case 'list':
        return await handleListTransactions(req, res, callerUid, callerIsAdmin);
      case 'create':
        return await handleCreateTransaction(req, res, callerIsAdmin, callerUid);
      case 'get':
        return await handleGetTransaction(req, res, transactionId);
      case 'stats':
        return await handleTransactionStats(req, res, callerIsAdmin);
      default:
        return res.status(404).json({ error: 'Action not found' });
    }
  } catch (error) {
    console.error('Transactions API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleListTransactions(req, res, callerUid, isAdmin) {
  const { limit = 50, userId, type, status } = req.query;
  
  let query = db.collection('transactions').orderBy('timestamp', 'desc');
  
  // Filter by user if not admin, or if userId specified
  if (!isAdmin) {
    query = query.where('userId', '==', callerUid);
  } else if (userId) {
    query = query.where('userId', '==', userId);
  }
  
  if (type) query = query.where('type', '==', type);
  if (status) query = query.where('status', '==', status);
  
  const snapshot = await query.limit(parseInt(limit)).get();
  const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return res.status(200).json({ success: true, transactions, count: transactions.length });
}

async function handleCreateTransaction(req, res, isAdmin, creatorUid) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { userId, type, amount, description, reference } = req.body;

  if (!userId || !type || !amount) {
    return res.status(400).json({ error: 'userId, type, and amount required' });
  }

  const transaction = {
    userId,
    type,
    amount: parseFloat(amount),
    description: description || '',
    reference: reference || `TXN-${Date.now()}`,
    status: 'completed',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: creatorUid
  };

  const docRef = await db.collection('transactions').add(transaction);

  return res.status(201).json({
    success: true,
    message: 'Transaction created',
    id: docRef.id,
    reference: transaction.reference
  });
}

async function handleGetTransaction(req, res, transactionId) {
  if (!transactionId) {
    return res.status(400).json({ error: 'Transaction ID required' });
  }

  const doc = await db.collection('transactions').doc(transactionId).get();
  
  if (!doc.exists) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  return res.status(200).json({ success: true, transaction: { id: doc.id, ...doc.data() } });
}

async function handleTransactionStats(req, res, isAdmin) {
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const snapshot = await db.collection('transactions').get();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let stats = {
    total: 0,
    totalVolume: 0,
    todayVolume: 0,
    byType: {},
    byStatus: {}
  };

  snapshot.forEach(doc => {
    const tx = doc.data();
    stats.total++;
    stats.totalVolume += tx.amount || 0;
    
    // Count by type
    stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;
    
    // Count by status
    stats.byStatus[tx.status] = (stats.byStatus[tx.status] || 0) + 1;
    
    // Today's volume
    if (tx.timestamp) {
      const txDate = tx.timestamp.toDate();
      if (txDate >= today) {
        stats.todayVolume += tx.amount || 0;
      }
    }
  });

  return res.status(200).json({ success: true, stats });
}

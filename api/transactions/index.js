// api/transactions/index.js
const express = require('express');
const router = express.Router();
const { collections } = require('../../config/firebase');
const { authenticate, authorize } = require('../../middleware/auth');

// Get all transactions (admin only)
router.get('/', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { limit = 50, type, status } = req.query;
    
    let query = collections.transactions.orderBy('date', 'desc').limit(parseInt(limit));
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    
    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user transactions
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check authorization
    if (req.user.uid !== userId && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const snapshot = await collections.transactions
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(50)
      .get();
    
    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, type, amount, description, metadata } = req.body;
    
    const transactionData = {
      userId,
      type,
      amount: parseFloat(amount),
      description,
      metadata: metadata || {},
      status: 'pending',
      date: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await collections.transactions.add(transactionData);
    
    res.json({
      success: true,
      id: docRef.id,
      ...transactionData
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const transactionDoc = await collections.transactions.doc(id).get();
    
    if (!transactionDoc.exists) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      success: true,
      transaction: {
        id: transactionDoc.id,
        ...transactionDoc.data()
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update transaction status (admin only)
router.patch('/:id/status', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await collections.transactions.doc(id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction summary
router.get('/summary/overview', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const snapshot = await collections.transactions.get();
    
    let totalVolume = 0;
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalInvestments = 0;
    let totalReturns = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const amount = data.amount || 0;
      
      totalVolume += amount;
      
      switch(data.type) {
        case 'deposit':
          totalDeposits += amount;
          break;
        case 'withdrawal':
          totalWithdrawals += amount;
          break;
        case 'investment':
          totalInvestments += amount;
          break;
        case 'return':
          totalReturns += amount;
          break;
      }
    });
    
    res.json({
      success: true,
      summary: {
        totalVolume,
        totalDeposits,
        totalWithdrawals,
        totalInvestments,
        totalReturns,
        netFlow: totalDeposits - totalWithdrawals
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

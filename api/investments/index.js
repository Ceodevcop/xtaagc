// api/investments/index.js
const express = require('express');
const router = express.Router();
const { collections } = require('../../config/firebase');
const { authenticate, authorize } = require('../../middleware/auth');

// Get all investments (admin only)
router.get('/', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const snapshot = await collections.investments
      .orderBy('date', 'desc')
      .limit(100)
      .get();
    
    const investments = [];
    snapshot.forEach(doc => {
      investments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: investments.length,
      investments
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create investment
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, amount, investorId } = req.body;
    
    // Get project details
    const projectDoc = await collections.projects.doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = projectDoc.data();
    
    // Create investment record
    const investmentData = {
      projectId,
      investorId: investorId || req.user.uid,
      amount: parseFloat(amount),
      status: 'pending',
      date: admin.firestore.FieldValue.serverTimestamp(),
      expectedReturn: parseFloat(amount) * (project.roi / 100),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await collections.investments.add(investmentData);
    
    // Update project raised amount
    const newRaised = (project.raisedAmount || 0) + parseFloat(amount);
    const newInvestors = (project.investors || 0) + 1;
    
    await collections.projects.doc(projectId).update({
      raisedAmount: newRaised,
      investors: newInvestors
    });
    
    res.json({
      success: true,
      id: docRef.id,
      ...investmentData
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const investmentDoc = await collections.investments.doc(id).get();
    
    if (!investmentDoc.exists) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.json({
      success: true,
      investment: {
        id: investmentDoc.id,
        ...investmentDoc.data()
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update investment status (admin only)
router.patch('/:id/status', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await collections.investments.doc(id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get returns for investment
router.get('/:id/returns', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const returns = await collections.transactions
      .where('investmentId', '==', id)
      .where('type', '==', 'return')
      .orderBy('date', 'desc')
      .get();
    
    const list = [];
    returns.forEach(doc => {
      list.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      returns: list
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

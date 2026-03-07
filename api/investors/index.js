// api/investors/index.js
const express = require('express');
const router = express.Router();
const { collections } = require('../../config/firebase');
const { authenticate, authorize } = require('../../middleware/auth');

// Get all investors (admin only)
router.get('/', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const snapshot = await collections.investors
      .orderBy('createdAt', 'desc')
      .get();
    
    const investors = [];
    snapshot.forEach(doc => {
      investors.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: investors.length,
      investors
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investor by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const investorDoc = await collections.investors.doc(id).get();
    
    if (!investorDoc.exists) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    res.json({
      success: true,
      investor: {
        id: investorDoc.id,
        ...investorDoc.data()
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create investor profile
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, investmentPreferences, riskTolerance } = req.body;
    
    const investorData = {
      userId,
      investmentPreferences: investmentPreferences || [],
      riskTolerance: riskTolerance || 'medium',
      totalInvested: 0,
      currentValue: 0,
      totalReturns: 0,
      investments: [],
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await collections.investors.add(investorData);
    
    res.json({
      success: true,
      id: docRef.id,
      ...investorData
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investor portfolio
router.get('/:id/portfolio', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const investments = await collections.investments
      .where('investorId', '==', id)
      .orderBy('date', 'desc')
      .get();
    
    const portfolio = [];
    investments.forEach(doc => {
      portfolio.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Calculate totals
    const totalInvested = portfolio.reduce((sum, inv) => sum + inv.amount, 0);
    const currentValue = portfolio.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
    const totalReturns = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
    
    res.json({
      success: true,
      summary: {
        totalInvested,
        currentValue,
        totalReturns,
        returnPercentage,
        investmentCount: portfolio.length
      },
      investments: portfolio
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

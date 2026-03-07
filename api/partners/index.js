// api/partners/index.js
const express = require('express');
const router = express.Router();
const { collections } = require('../../config/firebase');
const { authenticate, authorize } = require('../../middleware/auth');

// Get all partners
router.get('/', async (req, res) => {
  try {
    const snapshot = await collections.partners
      .where('status', '==', 'active')
      .orderBy('name')
      .get();
    
    const partners = [];
    snapshot.forEach(doc => {
      partners.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: partners.length,
      partners
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get partner by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const partnerDoc = await collections.partners.doc(id).get();
    
    if (!partnerDoc.exists) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json({
      success: true,
      partner: {
        id: partnerDoc.id,
        ...partnerDoc.data()
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create partner (admin only)
router.post('/', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { name, logo, description, website, commission } = req.body;
    
    const partnerData = {
      name,
      logo: logo || '',
      description,
      website,
      commission: parseFloat(commission),
      status: 'pending',
      projects: 0,
      investors: 0,
      totalInvestments: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await collections.partners.add(partnerData);
    
    res.json({
      success: true,
      id: docRef.id,
      ...partnerData
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update partner (admin only)
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await collections.partners.doc(id).update(updates);
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get partner projects
router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    
    const snapshot = await collections.projects
      .where('partnerId', '==', id)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get();
    
    const projects = [];
    snapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: projects.length,
      projects
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// api/projects/index.js
const express = require('express');
const router = express.Router();
const { collections } = require('../../config/firebase');
const { authenticate, authorize } = require('../../middleware/auth');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const snapshot = await collections.projects
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

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const projectDoc = await collections.projects.doc(id).get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({
      success: true,
      project: {
        id: projectDoc.id,
        ...projectDoc.data()
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project (admin only)
router.post('/', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { title, description, targetAmount, minInvestment, roi, duration, riskLevel } = req.body;
    
    const projectData = {
      title,
      description,
      targetAmount: parseFloat(targetAmount),
      minInvestment: parseFloat(minInvestment),
      roi: parseFloat(roi),
      duration: parseInt(duration),
      riskLevel,
      raisedAmount: 0,
      investors: 0,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    };
    
    const docRef = await collections.projects.add(projectData);
    
    res.json({
      success: true,
      id: docRef.id,
      ...projectData
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project (admin only)
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await collections.projects.doc(id).update(updates);
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    await collections.projects.doc(id).delete();
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project investments
router.get('/:id/investments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const investments = await collections.investments
      .where('projectId', '==', id)
      .orderBy('date', 'desc')
      .get();
    
    const list = [];
    investments.forEach(doc => {
      list.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: list.length,
      investments: list
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

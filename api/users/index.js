// api/users/index.js
const express = require('express');
const router = express.Router();
const { collections } = require('../../config/firebase');
const { authenticate, authorize } = require('../../middleware/auth');

// Get all users (admin only)
router.get('/', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const snapshot = await collections.users
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is accessing their own data or is admin
    if (req.user.uid !== id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const userDoc = await collections.users.doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userDoc.data()
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (admin only)
router.post('/', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { email, fullName, role, phone } = req.body;
    
    // Generate Admin ID if role is admin
    let generatedId = null;
    if (role === 'admin' || role === 'super_admin') {
      const now = new Date();
      generatedId = `Ad${Math.floor(Math.random() * 900 + 100)}/${now.getMonth()+1}/${now.getFullYear()}`;
    }
    
    const userData = {
      email,
      fullName,
      role,
      phone: phone || '',
      status: 'active',
      generatedId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await collections.users.add(userData);
    
    res.json({
      success: true,
      id: docRef.id,
      ...userData
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields
    delete updates.uid;
    delete updates.createdAt;
    
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await collections.users.doc(id).update(updates);
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    await collections.users.doc(id).delete();
    
    // Also delete from Auth if needed
    // await auth.deleteUser(id);
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user roles
router.get('/roles/list', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  res.json({
    roles: ['super_admin', 'admin', 'investor', 'client', 'partner', 'staff']
  });
});

// Update user role (admin only)
router.patch('/:id/role', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    await collections.users.doc(id).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

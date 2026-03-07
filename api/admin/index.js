// api/admin/index.js
const express = require('express');
const router = express.Router();
const { collections } = require('../../config/firebase');
const { authenticate, authorize } = require('../../middleware/auth');

// Get system stats
router.get('/stats', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const [
      usersSnapshot,
      investorsSnapshot,
      projectsSnapshot,
      investmentsSnapshot,
      transactionsSnapshot,
      partnersSnapshot,
      staffSnapshot
    ] = await Promise.all([
      collections.users.get(),
      collections.investors.get(),
      collections.projects.get(),
      collections.investments.get(),
      collections.transactions.get(),
      collections.partners.get(),
      collections.staff.get()
    ]);
    
    res.json({
      success: true,
      stats: {
        users: usersSnapshot.size,
        investors: investorsSnapshot.size,
        projects: projectsSnapshot.size,
        investments: investmentsSnapshot.size,
        transactions: transactionsSnapshot.size,
        partners: partnersSnapshot.size,
        staff: staffSnapshot.size
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
router.get('/activity', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const snapshot = await collections.auditLogs
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const activities = [];
    snapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: activities.length,
      activities
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system health
router.get('/health', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    // Check Firebase connection
    await collections.users.limit(1).get();
    
    res.json({
      success: true,
      health: {
        status: 'healthy',
        firebase: 'connected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      health: {
        status: 'unhealthy',
        firebase: 'disconnected',
        error: error.message
      }
    });
  }
});

// Get audit logs
router.get('/audit-logs', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { limit = 100, userId, action } = req.query;
    
    let query = collections.auditLogs.orderBy('timestamp', 'desc').limit(parseInt(limit));
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    
    if (action) {
      query = query.where('action', '==', action);
    }
    
    const snapshot = await query.get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: logs.length,
      logs
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export data
router.get('/export/:collection', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { collection } = req.params;
    
    if (!collections[collection]) {
      return res.status(400).json({ error: 'Invalid collection' });
    }
    
    const snapshot = await collections[collection].get();
    
    const data = [];
    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: data.length,
      data
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

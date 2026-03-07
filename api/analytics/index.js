// api/analytics/index.js
const express = require('express');
const router = express.Router();
const { collections } = require('../../config/firebase');
const { authenticate, authorize } = require('../../middleware/auth');

// Get dashboard analytics
router.get('/dashboard', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    // Get user stats
    const usersSnapshot = await collections.users.get();
    const totalUsers = usersSnapshot.size;
    const activeUsers = usersSnapshot.docs.filter(d => d.data().status === 'active').length;
    
    // Get investor stats
    const investorsSnapshot = await collections.investors.get();
    const totalInvestors = investorsSnapshot.size;
    
    // Get project stats
    const projectsSnapshot = await collections.projects.get();
    const totalProjects = projectsSnapshot.size;
    const activeProjects = projectsSnapshot.docs.filter(d => d.data().status === 'active').length;
    
    // Get investment stats
    const investmentsSnapshot = await collections.investments.get();
    const totalInvestments = investmentsSnapshot.size;
    let totalInvested = 0;
    investmentsSnapshot.forEach(doc => {
      totalInvested += doc.data().amount || 0;
    });
    
    // Get transaction stats
    const transactionsSnapshot = await collections.transactions.get();
    let totalVolume = 0;
    transactionsSnapshot.forEach(doc => {
      totalVolume += doc.data().amount || 0;
    });
    
    res.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        investors: {
          total: totalInvestors
        },
        projects: {
          total: totalProjects,
          active: activeProjects
        },
        investments: {
          total: totalInvestments,
          totalValue: totalInvested
        },
        transactions: {
          total: transactionsSnapshot.size,
          volume: totalVolume
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user growth
router.get('/users/growth', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const snapshot = await collections.users
      .where('createdAt', '>=', startDate)
      .orderBy('createdAt', 'asc')
      .get();
    
    const growth = [];
    let cumulative = 0;
    
    snapshot.forEach(doc => {
      const date = doc.data().createdAt.toDate().toISOString().split('T')[0];
      cumulative++;
      
      growth.push({
        date,
        newUsers: 1,
        totalUsers: cumulative
      });
    });
    
    res.json({
      success: true,
      growth
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investment trends
router.get('/investments/trends', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const snapshot = await collections.investments
      .where('date', '>=', startDate)
      .orderBy('date', 'asc')
      .get();
    
    const trends = [];
    let monthlyData = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.date.toDate();
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          count: 0,
          volume: 0
        };
      }
      
      monthlyData[month].count++;
      monthlyData[month].volume += data.amount || 0;
    });
    
    Object.keys(monthlyData).sort().forEach(month => {
      trends.push({
        month,
        count: monthlyData[month].count,
        volume: monthlyData[month].volume
      });
    });
    
    res.json({
      success: true,
      trends
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue stats
router.get('/revenue', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const investmentsSnapshot = await collections.investments.get();
    const transactionsSnapshot = await collections.transactions.get();
    
    let totalInvested = 0;
    let totalReturns = 0;
    let platformFees = 0;
    
    investmentsSnapshot.forEach(doc => {
      const data = doc.data();
      totalInvested += data.amount || 0;
      // Assume 2% platform fee
      platformFees += (data.amount || 0) * 0.02;
    });
    
    transactionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'return') {
        totalReturns += data.amount || 0;
      }
    });
    
    res.json({
      success: true,
      revenue: {
        totalInvested,
        totalReturns,
        platformFees,
        netRevenue: platformFees,
        projectedAnnual: platformFees * 12
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

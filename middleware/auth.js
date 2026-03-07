// middleware/auth.js
const { admin } = require('../config/firebase');

// Authenticate token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userDoc.data().role,
      ...userDoc.data()
    };
    
    next();
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorize roles
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role) && !req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};

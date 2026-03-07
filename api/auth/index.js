// api/auth/index.js
const express = require('express');
const router = express.Router();
const { auth, collections } = require('../../config/firebase');
const { validateEmail, validatePassword } = require('../../utils/validators');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get custom token from Firebase
    const userRecord = await auth.getUserByEmail(email);
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    // Get user data from Firestore
    const userDoc = await collections.users.doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const userData = userDoc.data();
    
    // Check account status
    if (userData.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }
    
    // Log login
    await collections.auditLogs.add({
      action: 'USER_LOGIN',
      userId: userRecord.uid,
      email: userRecord.email,
      role: userData.role,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip
    });
    
    res.json({
      success: true,
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role: userData.role,
        fullName: userData.fullName,
        permissions: userData.permissions || []
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role = 'client' } = req.body;
    
    // Validate input
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
      emailVerified: false
    });
    
    // Generate Admin ID
    const now = new Date();
    const adminId = role === 'admin' 
      ? `Ad${Math.floor(Math.random() * 900 + 100)}/${now.getMonth()+1}/${now.getFullYear()}`
      : null;
    
    // Create user profile in Firestore
    await collections.users.doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      fullName,
      role,
      status: 'pending',
      generatedId: adminId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send verification email
    await auth.generateEmailVerificationLink(email);
    
    res.json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      uid: userRecord.uid
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Verify email
router.post('/verify', async (req, res) => {
  try {
    const { uid } = req.body;
    
    await auth.updateUser(uid, {
      emailVerified: true
    });
    
    await collections.users.doc(uid).update({
      status: 'active',
      emailVerified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.post('/reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    await auth.generatePasswordResetLink(email);
    
    res.json({ success: true, message: 'Password reset email sent' });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { uid, newPassword } = req.body;
    
    await auth.updateUser(uid, {
      password: newPassword
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

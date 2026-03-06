/*/ api/auth.js - All auth endpoints in one file
import fetch from 'node-fetch';
import admin from './lib/firebase-admin.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  // If no action, show available endpoints
  if (!action) {
    return res.status(200).json({
      name: "TAAGC Auth API",
      description: "Single file auth handler",
      endpoints: {
        login: "POST /api/auth?action=login",
        register: "POST /api/auth?action=register",
        verify: "POST /api/auth?action=verify",
        reset: "POST /api/auth?action=reset",
        logout: "POST /api/auth?action=logout",
        profile: "GET /api/auth?action=profile",
        "change-password": "POST /api/auth?action=changePassword"
      }
    });
  }

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'register':
        return await handleRegister(req, res);
      case 'verify':
        return await handleVerify(req, res);
      case 'reset':
        return await handleReset(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'profile':
        return await handleProfile(req, res);
      case 'changePassword':
        return await handleChangePassword(req, res);
      default:
        return res.status(404).json({ 
          error: 'Action not found',
          available: ['login', 'register', 'verify', 'reset', 'logout', 'profile', 'changePassword']
        });
    }
  } catch (error) {
    console.error(`Auth error (${action}):`, error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// LOGIN HANDLER
// ============================================
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(401).json({ error: data.error?.message || 'Login failed' });
    }

    // Get user data from Firestore
    let userData = {};
    try {
      const userDoc = await admin.firestore().collection('users').doc(data.localId).get();
      if (userDoc.exists) {
        userData = userDoc.data();
      }
    } catch (e) {
      console.log('Firestore fetch error:', e);
    }

    return res.status(200).json({
      success: true,
      uid: data.localId,
      email: data.email,
      token: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================
// REGISTER HANDLER
// ============================================
async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const { email, password, fullName, phone, role = 'client' } = req.body;
  
  if (!email || !password || !fullName) {
    return res.status(400).json({ 
      error: 'Email, password, and full name required' 
    });
  }

  try {
    // Create user in Firebase Auth
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(400).json({ 
        error: data.error?.message || 'Registration failed' 
      });
    }

    // Save to Firestore
    await admin.firestore().collection('users').doc(data.localId).set({
      fullName,
      email,
      phone: phone || '',
      role,
      status: 'active',
      emailVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uid: data.localId
    });

    return res.status(201).json({
      success: true,
      uid: data.localId,
      email: data.email,
      token: data.idToken,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================
// VERIFY EMAIL HANDLER
// ============================================
async function handleVerify(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decodedToken.uid);
    
    // Update Firestore if verified
    if (user.emailVerified) {
      await admin.firestore().collection('users').doc(decodedToken.uid).update({
        emailVerified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return res.status(200).json({
      success: true,
      verified: user.emailVerified,
      email: user.email
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ============================================
// PASSWORD RESET HANDLER
// ============================================
async function handleReset(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    
    // In production, you'd email this link
    // For development, we return it
    return res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetLink: process.env.NODE_ENV === 'development' ? link : undefined
    });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================
// LOGOUT HANDLER
// ============================================
async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    await admin.auth().revokeRefreshTokens(decodedToken.uid);
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================
// PROFILE HANDLER
// ============================================
async function handleProfile(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // GET - Retrieve profile
    if (req.method === 'GET') {
      const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      
      return res.status(200).json({
        success: true,
        profile: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          ...userDoc.data()
        }
      });
    }
    
    // PUT/PATCH - Update profile
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const updates = req.body;
      
      // Remove fields that shouldn't be updated directly
      delete updates.uid;
      delete updates.email;
      delete updates.role;
      delete updates.createdAt;
      
      await admin.firestore().collection('users').doc(decodedToken.uid).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully'
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================
// CHANGE PASSWORD HANDLER
// ============================================
async function handleChangePassword(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    await admin.auth().updateUser(decodedToken.uid, {
      password: newPassword
    });
    
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}*/// api/auth.js
import fetch from 'node-fetch';
import admin, { db, verifyToken, logAudit } from './lib/firebase-admin.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  // Show available actions
  if (!action) {
    return res.status(200).json({
      name: "TAAGC Auth API",
      endpoints: {
        login: "POST /api/auth?action=login",
        register: "POST /api/auth?action=register",
        verify: "POST /api/auth?action=verify",
        reset: "POST /api/auth?action=reset",
        logout: "POST /api/auth?action=logout",
        profile: "GET /api/auth?action=profile",
        me: "GET /api/auth?action=me"
      }
    });
  }

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'register':
        return await handleRegister(req, res);
      case 'verify':
        return await handleVerify(req, res);
      case 'reset':
        return await handleReset(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'profile':
        return await handleProfile(req, res);
      case 'me':
        return await handleMe(req, res);
      default:
        return res.status(404).json({ error: 'Action not found' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Login Handler
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ error: data.error?.message });
    }

    // Get Firestore data
    let userData = {};
    try {
      const userDoc = await db.collection('users').doc(data.localId).get();
      if (userDoc.exists) userData = userDoc.data();
    } catch (e) {
      console.log('Firestore fetch error:', e);
    }

    await logAudit(data.localId, 'login', { email }, req.socket.remoteAddress);

    return res.status(200).json({
      success: true,
      uid: data.localId,
      email: data.email,
      token: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Register Handler
async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, fullName, phone, role = 'client' } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name required' });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: data.error?.message });
    }

    // Save to Firestore
    await db.collection('users').doc(data.localId).set({
      fullName,
      email,
      phone: phone || '',
      role,
      status: 'active',
      emailVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uid: data.localId
    });

    await logAudit(data.localId, 'register', { email }, req.socket.remoteAddress);

    return res.status(201).json({
      success: true,
      uid: data.localId,
      email: data.email,
      token: data.idToken,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Verify Email Handler
async function handleVerify(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  const result = await verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = await admin.auth().getUser(result.decoded.uid);

  return res.status(200).json({
    success: true,
    verified: user.emailVerified,
    email: user.email
  });
}

// Password Reset Handler
async function handleReset(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    
    return res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      link: process.env.NODE_ENV === 'development' ? link : undefined
    });
  } catch (error) {
    console.error('Reset error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Logout Handler
async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  const result = await verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  await admin.auth().revokeRefreshTokens(result.decoded.uid);
  await logAudit(result.decoded.uid, 'logout', {}, req.socket.remoteAddress);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

// Profile Handler
async function handleProfile(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  const result = await verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (req.method === 'GET') {
    const userDoc = await db.collection('users').doc(result.decoded.uid).get();
    
    return res.status(200).json({
      success: true,
      profile: {
        uid: result.decoded.uid,
        email: result.decoded.email,
        ...(userDoc.exists ? userDoc.data() : {})
      }
    });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const updates = req.body;
    delete updates.uid;
    delete updates.email;
    delete updates.role;

    await db.collection('users').doc(result.decoded.uid).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Me Handler (Current User Info)
async function handleMe(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  const result = await verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userRecord = await admin.auth().getUser(result.decoded.uid);
  const userDoc = await db.collection('users').doc(result.decoded.uid).get();

  return res.status(200).json({
    success: true,
    user: {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName,
      createdAt: userRecord.metadata.creationTime,
      lastLogin: userRecord.metadata.lastSignInTime,
      ...(userDoc.exists ? userDoc.data() : {})
    }
  });
}


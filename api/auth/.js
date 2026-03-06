// api/auth.js - Single file handling all auth endpoints
import fetch from 'node-fetch';
import admin from '../lib/firebase-admin.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the action from query parameter or URL path
  const { action } = req.query;
  
  // If no action specified, show available endpoints
  if (!action) {
    return res.status(200).json({
      name: "TAAGC Auth API",
      endpoints: {
        login: "/api/auth?action=login",
        register: "/api/auth?action=register",
        verify: "/api/auth?action=verify",
        reset: "/api/auth?action=reset",
        logout: "/api/auth?action=logout",
        profile: "/api/auth?action=profile"
      }
    });
  }

  // Route to appropriate handler based on action
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
      default:
        return res.status(404).json({ error: 'Action not found' });
    }
  } catch (error) {
    console.error(`Auth API error (${action}):`, error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// LOGIN HANDLER
// ============================================
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Call Firebase Auth REST API
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return res.status(401).json({ 
      error: data.error?.message || 'Authentication failed' 
    });
  }

  // Get additional user data from Firestore
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
}

// ============================================
// REGISTER HANDLER
// ============================================
async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST' });
  }

  const { email, password, fullName, phone, role = 'client' } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ 
      error: 'Email, password, and full name required' 
    });
  }

  // Create user in Firebase Auth
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return res.status(400).json({ 
      error: data.error?.message || 'Registration failed' 
    });
  }

  // Save additional user data to Firestore
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
}

// ============================================
// VERIFY EMAIL HANDLER
// ============================================
async function handleVerify(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  // Verify the token
  const decodedToken = await admin.auth().verifyIdToken(token);
  
  // Send email verification
  const user = await admin.auth().getUser(decodedToken.uid);
  
  if (user.emailVerified) {
    return res.status(200).json({ 
      success: true, 
      verified: true,
      message: 'Email already verified' 
    });
  }

  // Generate email verification link
  const link = await admin.auth().generateEmailVerificationLink(decodedToken.email);
  
  // In production, send this link via email
  return res.status(200).json({
    success: true,
    verified: false,
    verificationLink: link,
    message: 'Verification email sent'
  });
}

// ============================================
// PASSWORD RESET HANDLER
// ============================================
async function handleReset(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    // Generate password reset link
    const link = await admin.auth().generatePasswordResetLink(email);
    
    // In production, send this link via email
    return res.status(200).json({
      success: true,
      resetLink: link,
      message: 'Password reset email sent'
    });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    throw error;
  }
}

// ============================================
// LOGOUT HANDLER
// ============================================
async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  // Revoke refresh tokens
  const decodedToken = await admin.auth().verifyIdToken(token);
  await admin.auth().revokeRefreshTokens(decodedToken.uid);
  
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
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
  
  // Verify the token
  const decodedToken = await admin.auth().verifyIdToken(token);
  
  if (req.method === 'GET') {
    // Get user profile
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
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
  
  if (req.method === 'PUT' || req.method === 'PATCH') {
    // Update user profile
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.uid;
    delete updates.email;
    delete updates.role;
    
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
}

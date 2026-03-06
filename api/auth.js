// api/auth.js - Complete auth handler
import fetch from 'node-fetch';
import admin from '../lib/firebase-admin.js';

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
      description: "Use ?action parameter to access endpoints",
      endpoints: {
        login: "POST /api/auth?action=login",
        register: "POST /api/auth?action=register",
        verify: "POST /api/auth?action=verify",
        reset: "POST /api/auth?action=reset",
        logout: "POST /api/auth?action=logout",
        profile: "GET /api/auth?action=profile"
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
      default:
        return res.status(404).json({ 
          error: 'Action not found',
          available: ['login', 'register', 'verify', 'reset', 'logout', 'profile']
        });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ===== HANDLER FUNCTIONS =====

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

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

  return res.status(200).json({
    success: true,
    uid: data.localId,
    email: data.email,
    token: data.idToken,
    refreshToken: data.refreshToken
  });
}

async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const { email, password, fullName, phone, role = 'client' } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name required' });
  }

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
  await admin.firestore().collection('users').doc(data.localId).set({
    fullName,
    email,
    phone: phone || '',
    role,
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return res.status(201).json({
    success: true,
    uid: data.localId,
    email: data.email,
    token: data.idToken,
    message: 'User created'
  });
}

async function handleVerify(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  
  const user = await admin.auth().getUser(decodedToken.uid);
  
  return res.status(200).json({
    success: true,
    verified: user.emailVerified,
    email: user.email
  });
}

async function handleReset(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const link = await admin.auth().generatePasswordResetLink(email);
  
  return res.status(200).json({
    success: true,
    message: 'Reset email sent',
    link // Remove in production
  });
}

async function handleLogout(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  await admin.auth().revokeRefreshTokens(decodedToken.uid);
  
  return res.status(200).json({ success: true, message: 'Logged out' });
}

async function handleProfile(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  
  if (req.method === 'GET') {
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    return res.status(200).json({
      success: true,
      profile: userDoc.data() || { uid: decodedToken.uid, email: decodedToken.email }
    });
  }

  if (req.method === 'PUT') {
    await admin.firestore().collection('users').doc(decodedToken.uid).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return res.status(200).json({ success: true, message: 'Profile updated' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

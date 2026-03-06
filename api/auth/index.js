// api/auth/index.js - FIXED IMPORT PATH
import admin, { auth, db, verifyToken, logAudit } from '../lib/firebase-admin.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

// ===== HANDLER FUNCTIONS =====

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

async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
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

async function handleVerify(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const user = await admin.auth().getUser(decodedToken.uid);

    return res.status(200).json({
      success: true,
      verified: user.emailVerified,
      email: user.email
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

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

async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
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

async function handleProfile(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);

    if (req.method === 'GET') {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      
      return res.status(200).json({
        success: true,
        profile: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          ...(userDoc.exists ? userDoc.data() : {})
        }
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const updates = req.body;
      delete updates.uid;
      delete updates.email;
      delete updates.role;

      await db.collection('users').doc(decodedToken.uid).update({
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

async function handleMe(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

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
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/*/ api/users.js - All user management in one file
import admin from './lib/firebase-admin.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, userId } = req.query;

  // Verify authentication for all user endpoints
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if user is admin
    const callerDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    const callerData = callerDoc.data();
    
    const isAdmin = callerData?.role === 'super_admin' || callerData?.role === 'admin';
    
    // Route based on action or method
    if (action === 'list' || (!action && req.method === 'GET')) {
      return await handleListUsers(req, res, isAdmin);
    } else if (action === 'create' || req.method === 'POST') {
      return await handleCreateUser(req, res, isAdmin, decodedToken.uid);
    } else if (action === 'get' && userId) {
      return await handleGetUser(req, res, userId, isAdmin, decodedToken.uid);
    } else if (action === 'update' && userId) {
      return await handleUpdateUser(req, res, userId, isAdmin, decodedToken.uid);
    } else if (action === 'delete' && userId) {
      return await handleDeleteUser(req, res, userId, isAdmin);
    } else if (action === 'stats') {
      return await handleUserStats(req, res, isAdmin);
    } else {
      return res.status(200).json({
        name: "TAAGC Users API",
        endpoints: {
          list: "GET /api/users?action=list",
          create: "POST /api/users?action=create",
          get: "GET /api/users?action=get&userId={id}",
          update: "PUT /api/users?action=update&userId={id}",
          delete: "DELETE /api/users?action=delete&userId={id}",
          stats: "GET /api/users?action=stats"
        }
      });
    }
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ============================================
// LIST USERS
// ============================================
async function handleListUsers(req, res, isAdmin) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET method' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  try {
    const { limit = 100, pageToken } = req.query;
    
    const listUsersResult = await admin.auth().listUsers(parseInt(limit), pageToken);
    
    // Get Firestore data for each user
    const usersWithData = await Promise.all(
      listUsersResult.users.map(async (user) => {
        const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          disabled: user.disabled,
          createdAt: user.metadata.creationTime,
          lastLogin: user.metadata.lastSignInTime,
          ...(userDoc.exists ? userDoc.data() : {})
        };
      })
    );

    return res.status(200).json({
      success: true,
      users: usersWithData,
      pageToken: listUsersResult.pageToken,
      count: usersWithData.length
    });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// CREATE USER
// ============================================
async function handleCreateUser(req, res, isAdmin, creatorUid) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  const { email, password, fullName, phone, role = 'client', status = 'active' } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ 
      error: 'Email, password, and full name required' 
    });
  }

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
      emailVerified: false,
      disabled: false
    });

    // Save to Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      fullName,
      email,
      phone: phone || '',
      role,
      status,
      emailVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: creatorUid,
      uid: userRecord.uid
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      uid: userRecord.uid
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// GET USER
// ============================================
async function handleGetUser(req, res, userId, isAdmin, callerUid) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET method' });
  }

  // Allow users to get their own profile, admins to get any
  if (!isAdmin && callerUid !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const userRecord = await admin.auth().getUser(userId);
    const userDoc = await admin.firestore().collection('users').doc(userId).get();

    return res.status(200).json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        createdAt: userRecord.metadata.creationTime,
        lastLogin: userRecord.metadata.lastSignInTime,
        ...(userDoc.exists ? userDoc.data() : {})
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// UPDATE USER
// ============================================
async function handleUpdateUser(req, res, userId, isAdmin, callerUid) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Use PUT or PATCH method' });
  }

  // Allow users to update their own profile, admins to update any
  if (!isAdmin && callerUid !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updates = req.body;

  try {
    // Update Auth if allowed fields are present
    const authUpdates = {};
    if (updates.email) authUpdates.email = updates.email;
    if (updates.password) authUpdates.password = updates.password;
    if (updates.fullName) authUpdates.displayName = updates.fullName;
    if (updates.disabled !== undefined && isAdmin) authUpdates.disabled = updates.disabled;

    if (Object.keys(authUpdates).length > 0) {
      await admin.auth().updateUser(userId, authUpdates);
    }

    // Update Firestore (remove auth fields)
    delete updates.password;
    delete updates.email;
    
    if (Object.keys(updates).length > 0) {
      await admin.firestore().collection('users').doc(userId).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: callerUid
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// DELETE USER
// ============================================
async function handleDeleteUser(req, res, userId, isAdmin) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Use DELETE method' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  try {
    // Delete from Auth
    await admin.auth().deleteUser(userId);
    
    // Delete from Firestore
    await admin.firestore().collection('users').doc(userId).delete();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// USER STATS
// ============================================
async function handleUserStats(req, res, isAdmin) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET method' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let stats = {
      total: 0,
      byRole: { super_admin: 0, admin: 0, investor: 0, client: 0 },
      byStatus: { active: 0, pending: 0, suspended: 0 },
      newToday: 0,
      newThisMonth: 0,
      verified: 0
    };

    usersSnapshot.forEach(doc => {
      const user = doc.data();
      stats.total++;
      
      // Count by role
      if (stats.byRole.hasOwnProperty(user.role)) {
        stats.byRole[user.role]++;
      }
      
      // Count by status
      if (stats.byStatus.hasOwnProperty(user.status)) {
        stats.byStatus[user.status]++;
      }
      
      // Count verified
      if (user.emailVerified) stats.verified++;
      
      // Count new today/this month
      if (user.createdAt) {
        const created = user.createdAt.toDate();
        if (created >= today) stats.newToday++;
        if (created >= monthAgo) stats.newThisMonth++;
      }
    });

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('User stats error:', error);
    return res.status(500).json({ error: error.message });
  }
}


xxxxxxxxxxcc
// api/users.js
import admin, { db, isAdmin, isSuperAdmin, verifyToken, logAudit, snapshotToArray } from './lib/firebase-admin.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, userId } = req.query;

  // Show available actions
  if (!action) {
    return res.status(200).json({
      name: "TAAGC Users API",
      endpoints: {
        list: "GET /api/users?action=list",
        create: "POST /api/users?action=create",
        get: "GET /api/users?action=get&userId={id}",
        update: "PUT /api/users?action=update&userId={id}",
        delete: "DELETE /api/users?action=delete&userId={id}",
        stats: "GET /api/users?action=stats",
        roles: "GET /api/users?action=roles"
      }
    });
  }

  // Verify authentication for all endpoints
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  const tokenResult = await verifyToken(token);

  if (!tokenResult.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const callerUid = tokenResult.decoded.uid;
  const callerIsAdmin = await isAdmin(callerUid);
  const callerIsSuperAdmin = await isSuperAdmin(callerUid);

  try {
    switch (action) {
      case 'list':
        return await handleListUsers(req, res, callerIsAdmin);
      case 'create':
        return await handleCreateUser(req, res, callerIsAdmin, callerUid);
      case 'get':
        return await handleGetUser(req, res, userId, callerIsAdmin, callerUid);
      case 'update':
        return await handleUpdateUser(req, res, userId, callerIsAdmin, callerUid);
      case 'delete':
        return await handleDeleteUser(req, res, userId, callerIsSuperAdmin);
      case 'stats':
        return await handleUserStats(req, res, callerIsAdmin);
      case 'roles':
        return await handleRoles(req, res, callerIsAdmin);
      default:
        return res.status(404).json({ error: 'Action not found' });
    }
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// List Users
async function handleListUsers(req, res, isAdmin) {
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { limit = 100, pageToken } = req.query;
  
  const listResult = await admin.auth().listUsers(parseInt(limit), pageToken);
  
  const usersWithData = await Promise.all(
    listResult.users.map(async (user) => {
      const userDoc = await db.collection('users').doc(user.uid).get();
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        createdAt: user.metadata.creationTime,
        lastLogin: user.metadata.lastSignInTime,
        ...(userDoc.exists ? userDoc.data() : {})
      };
    })
  );

  return res.status(200).json({
    success: true,
    users: usersWithData,
    pageToken: listResult.pageToken,
    count: usersWithData.length
  });
}

// Create User
async function handleCreateUser(req, res, isAdmin, creatorUid) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { email, password, fullName, phone, role = 'client', status = 'active' } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name required' });
  }

  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: fullName
  });

  await db.collection('users').doc(userRecord.uid).set({
    fullName,
    email,
    phone: phone || '',
    role,
    status,
    emailVerified: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: creatorUid,
    uid: userRecord.uid
  });

  await logAudit(creatorUid, 'user_create', { targetUid: userRecord.uid, role });

  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    uid: userRecord.uid
  });
}

// Get User
async function handleGetUser(req, res, userId, isAdmin, callerUid) {
  if (!isAdmin && callerUid !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const userRecord = await admin.auth().getUser(userId);
  const userDoc = await db.collection('users').doc(userId).get();

  return res.status(200).json({
    success: true,
    user: {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      createdAt: userRecord.metadata.creationTime,
      lastLogin: userRecord.metadata.lastSignInTime,
      ...(userDoc.exists ? userDoc.data() : {})
    }
  });
}

// Update User
async function handleUpdateUser(req, res, userId, isAdmin, callerUid) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Use PUT or PATCH method' });
  }

  if (!isAdmin && callerUid !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const updates = req.body;

  // Update Auth if allowed
  const authUpdates = {};
  if (updates.email) authUpdates.email = updates.email;
  if (updates.password) authUpdates.password = updates.password;
  if (updates.fullName) authUpdates.displayName = updates.fullName;
  if (updates.disabled !== undefined && isAdmin) authUpdates.disabled = updates.disabled;

  if (Object.keys(authUpdates).length > 0) {
    await admin.auth().updateUser(userId, authUpdates);
  }

  // Update Firestore
  delete updates.password;
  delete updates.email;
  
  if (Object.keys(updates).length > 0) {
    await db.collection('users').doc(userId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: callerUid
    });
  }

  await logAudit(callerUid, 'user_update', { targetUid: userId, updates });

  return res.status(200).json({
    success: true,
    message: 'User updated successfully'
  });
}

// Delete User
async function handleDeleteUser(req, res, userId, isSuperAdmin) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Use DELETE method' });
  }

  if (!isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  await admin.auth().deleteUser(userId);
  await db.collection('users').doc(userId).delete();

  return res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}

// User Stats
async function handleUserStats(req, res, isAdmin) {
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const usersSnapshot = await db.collection('users').get();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const stats = {
    total: 0,
    byRole: { super_admin: 0, admin: 0, investor: 0, client: 0 },
    byStatus: { active: 0, pending: 0, suspended: 0 },
    newToday: 0,
    newThisMonth: 0,
    verified: 0
  };

  usersSnapshot.forEach(doc => {
    const user = doc.data();
    stats.total++;
    
    if (stats.byRole[user.role]) stats.byRole[user.role]++;
    if (stats.byStatus[user.status]) stats.byStatus[user.status]++;
    if (user.emailVerified) stats.verified++;
    
    if (user.createdAt) {
      const created = user.createdAt.toDate();
      if (created >= today) stats.newToday++;
      if (created >= monthAgo) stats.newThisMonth++;
    }
  });

  return res.status(200).json({ success: true, stats });
}

// Get Available Roles
async function handleRoles(req, res, isAdmin) {
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return res.status(200).json({
    success: true,
    roles: [
      { id: 'super_admin', name: 'Super Admin', description: 'Full system access' },
      { id: 'admin', name: 'Admin', description: 'Manage users and content' },
      { id: 'investor', name: 'Investor', description: 'Investment access' },
      { id: 'client', name: 'Client', description: 'Trading access' }
    ]
  });
}
*/
// api/users.js - Debug version
import admin from './lib/firebase-admin.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check if admin is initialized
    const isAdminInitialized = admin.apps.length > 0;
    
    // Check for auth header
    const authHeader = req.headers.authorization;
    const hasAuth = !!authHeader?.startsWith('Bearer ');
    
    // Return debug info
    return res.status(200).json({
      success: true,
      debug: {
        method: req.method,
        hasAuthHeader: hasAuth,
        adminInitialized: isAdminInitialized,
        projectId: process.env.FIREBASE_PROJECT_ID || 'not set',
        nodeEnv: process.env.NODE_ENV,
        query: req.query
      },
      message: "Users API is working in debug mode"
    });
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
}

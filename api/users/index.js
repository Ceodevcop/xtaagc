// api/users/index.js
import admin, { db, isAdmin, isSuperAdmin, verifyToken, logAudit } from '../lib/firebase-admin.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
        stats: "GET /api/users?action=stats"
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

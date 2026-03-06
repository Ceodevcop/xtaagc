// api/set-role.js
import admin, { isSuperAdmin, verifyToken, logAudit } from './lib/firebase-admin.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  const callerIsSuperAdmin = await isSuperAdmin(callerUid);

  if (!callerIsSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }

  const { uid, role } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ error: 'uid and role required' });
  }

  const validRoles = ['super_admin', 'admin', 'investor', 'client'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role: role,
      [role]: true
    });

    // Update Firestore
    await admin.firestore().collection('users').doc(uid).update({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: callerUid
    });

    await logAudit(callerUid, 'role_change', { targetUid: uid, newRole: role });

    return res.status(200).json({
      success: true,
      message: `Role set to ${role} successfully`
    });
  } catch (error) {
    console.error('Set role error:', error);
    return res.status(500).json({ error: error.message });
  }
}

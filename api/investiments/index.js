// api/investments/index.js
import admin, { db, isAdmin, verifyToken } from '../lib/firebase-admin.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, investmentId } = req.query;

  if (!action) {
    return res.status(200).json({
      name: "TAAGC Investments API",
      endpoints: {
        list: "GET /api/investments?action=list",
        create: "POST /api/investments?action=create",
        get: "GET /api/investments?action=get&investmentId={id}",
        update: "PUT /api/investments?action=update&investmentId={id}",
        delete: "DELETE /api/investments?action=delete&investmentId={id}",
        stats: "GET /api/investments?action=stats"
      }
    });
  }

  // Verify authentication
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

  try {
    switch (action) {
      case 'list':
        return await handleListInvestments(req, res);
      case 'create':
        return await handleCreateInvestment(req, res, callerIsAdmin, callerUid);
      case 'get':
        return await handleGetInvestment(req, res, investmentId);
      case 'update':
        return await handleUpdateInvestment(req, res, investmentId, callerIsAdmin);
      case 'delete':
        return await handleDeleteInvestment(req, res, investmentId, callerIsAdmin);
      case 'stats':
        return await handleInvestmentStats(req, res);
      default:
        return res.status(404).json({ error: 'Action not found' });
    }
  } catch (error) {
    console.error('Investments API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleListInvestments(req, res) {
  const { limit = 50, status } = req.query;
  
  let query = db.collection('investments').orderBy('createdAt', 'desc');
  
  if (status) {
    query = query.where('status', '==', status);
  }
  
  const snapshot = await query.limit(parseInt(limit)).get();
  const investments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return res.status(200).json({ success: true, investments, count: investments.length });
}

async function handleCreateInvestment(req, res, isAdmin, creatorUid) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { title, amount, roi, investorId, duration, description } = req.body;

  if (!title || !amount || !investorId) {
    return res.status(400).json({ error: 'Title, amount, and investorId required' });
  }

  // Get investor name
  const investorDoc = await db.collection('users').doc(investorId).get();
  const investorName = investorDoc.exists ? investorDoc.data().fullName : 'Unknown';

  const investment = {
    title,
    amount: parseFloat(amount),
    roi: parseFloat(roi || 0),
    investorId,
    investorName,
    duration: duration || '',
    description: description || '',
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: creatorUid
  };

  const docRef = await db.collection('investments').add(investment);

  return res.status(201).json({
    success: true,
    message: 'Investment created',
    id: docRef.id
  });
}

async function handleGetInvestment(req, res, investmentId) {
  if (!investmentId) {
    return res.status(400).json({ error: 'Investment ID required' });
  }

  const doc = await db.collection('investments').doc(investmentId).get();
  
  if (!doc.exists) {
    return res.status(404).json({ error: 'Investment not found' });
  }

  return res.status(200).json({ success: true, investment: { id: doc.id, ...doc.data() } });
}

async function handleUpdateInvestment(req, res, investmentId, isAdmin) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Use PUT or PATCH method' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!investmentId) {
    return res.status(400).json({ error: 'Investment ID required' });
  }

  const updates = req.body;
  delete updates.id;
  delete updates.createdAt;

  await db.collection('investments').doc(investmentId).update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return res.status(200).json({ success: true, message: 'Investment updated' });
}

async function handleDeleteInvestment(req, res, investmentId, isAdmin) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Use DELETE method' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!investmentId) {
    return res.status(400).json({ error: 'Investment ID required' });
  }

  await db.collection('investments').doc(investmentId).delete();

  return res.status(200).json({ success: true, message: 'Investment deleted' });
}

async function handleInvestmentStats(req, res) {
  const snapshot = await db.collection('investments').get();
  
  let totalInvested = 0;
  let activeCount = 0;
  let totalRoi = 0;

  snapshot.forEach(doc => {
    const inv = doc.data();
    totalInvested += inv.amount || 0;
    if (inv.status === 'active') activeCount++;
    totalRoi += inv.roi || 0;
  });

  const stats = {
    totalInvestments: snapshot.size,
    totalInvested,
    activeInvestments: activeCount,
    averageRoi: snapshot.size ? (totalRoi / snapshot.size).toFixed(2) : 0
  };

  return res.status(200).json({ success: true, stats });
}

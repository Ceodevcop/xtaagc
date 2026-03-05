import admin from '../../lib/firebase-admin';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(token);

    switch (req.method) {
      case 'GET':
        const { userId, type, status, startDate, endDate, limit = 100 } = req.query;
        
        let query = admin.firestore().collection('transactions');
        
        if (userId) query = query.where('userId', '==', userId);
        if (type) query = query.where('type', '==', type);
        if (status) query = query.where('status', '==', status);
        if (startDate) query = query.where('timestamp', '>=', new Date(startDate));
        if (endDate) query = query.where('timestamp', '<=', new Date(endDate));
        
        query = query.orderBy('timestamp', 'desc').limit(parseInt(limit));
        
        const snapshot = await query.get();
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        res.status(200).json({ success: true, transactions });
        break;

      case 'POST':
        const transaction = req.body;
        transaction.timestamp = admin.firestore.FieldValue.serverTimestamp();
        
        const docRef = await admin.firestore().collection('transactions').add(transaction);
        
        res.status(201).json({ 
          success: true, 
          message: 'Transaction created',
          id: docRef.id 
        });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

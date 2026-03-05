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

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    switch (req.method) {
      case 'GET':
        const investmentsSnapshot = await admin.firestore().collection('investments')
          .orderBy('createdAt', 'desc')
          .get();
        
        const investments = investmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        res.status(200).json({ success: true, investments });
        break;

      case 'POST':
        const { title, amount, roi, investorId, duration } = req.body;

        // Get investor name
        const investorDoc = await admin.firestore().collection('users').doc(investorId).get();
        const investorName = investorDoc.exists ? investorDoc.data().fullName : 'Unknown';

        const investment = {
          title,
          amount: parseFloat(amount),
          roi: parseFloat(roi),
          investorId,
          investorName,
          duration,
          status: 'active',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: decodedToken.uid
        };

        const docRef = await admin.firestore().collection('investments').add(investment);

        res.status(201).json({ 
          success: true, 
          message: 'Investment created successfully',
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

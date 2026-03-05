import admin from '../../lib/firebase-admin';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if user is admin
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData || (userData.role !== 'super_admin' && userData.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        const usersSnapshot = await admin.firestore().collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        res.status(200).json({ success: true, users });
        break;

      case 'POST':
        const { email, password, fullName, role } = req.body;
        
        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
          email,
          password,
          displayName: fullName
        });

        // Save to Firestore
        await admin.firestore().collection('users').doc(userRecord.uid).set({
          fullName,
          email,
          role: role || 'client',
          status: 'active',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: userId
        });

        res.status(201).json({ 
          success: true, 
          message: 'User created successfully',
          userId: userRecord.uid 
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

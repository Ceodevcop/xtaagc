// api/set-role.js - Using Application Default Credentials (No Keys Needed!)
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userToken = authHeader.split('Bearer ')[1];
  const { uid, role } = req.body;

  try {
    // Step 1: Verify the user's token is valid
    const verifyResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: userToken })
      }
    );

    const verifyData = await verifyResponse.json();
    
    if (!verifyResponse.ok || !verifyData.users || verifyData.users[0].localId !== uid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Step 2: Get Google Auth token using Application Default Credentials
    // Vercel automatically handles ADC in their environment!
    const auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase',
        'https://www.googleapis.com/auth/datastore'
      ]
    });

    // Get the client and access token
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    // Step 3: Set custom claims using Google Identity Toolkit API
    const claimsResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/accounts:update`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localId: uid,
          customAttributes: JSON.stringify({ 
            role: role,
            [role]: true 
          })
        })
      }
    );

    if (!claimsResponse.ok) {
      const errorData = await claimsResponse.json();
      throw new Error(errorData.error?.message || 'Failed to set custom claims');
    }

    // Step 4: Update Firestore
    const firestoreResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            role: { stringValue: role },
            updatedAt: { timestampValue: new Date().toISOString() }
          }
        })
      }
    );

    if (!firestoreResponse.ok) {
      const errorData = await firestoreResponse.json();
      console.error('Firestore update error:', errorData);
      // Don't throw - claims are more important
    }

    // Step 5: Return success
    res.status(200).json({ 
      success: true, 
      message: `Role set to ${role} successfully`,
      uid: uid,
      role: role
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
}

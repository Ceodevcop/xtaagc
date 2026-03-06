// api/lib/firebase-admin.js
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    // Check for service account credentials
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_CLIENT_EMAIL && 
        process.env.FIREBASE_PRIVATE_KEY) {
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ Firebase Admin initialized with service account');
    } else {
      // Fall back to Application Default Credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || 'xtaagc'
      });
      console.log('✅ Firebase Admin initialized with ADC');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    
    // Emergency fallback - minimal config
    try {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'xtaagc'
      });
      console.log('⚠️ Firebase Admin initialized with minimal config');
    } catch (fallbackError) {
      console.error('❌ All initialization attempts failed:', fallbackError);
    }
  }
}

// Export services
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

// Helper: Verify token
export async function verifyToken(token) {
  try {
    const decoded = await auth.verifyIdToken(token);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Helper: Check if user is admin
export async function isAdmin(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return false;
    const role = userDoc.data().role;
    return role === 'admin' || role === 'super_admin';
  } catch {
    return false;
  }
}

// Helper: Log audit action
export async function logAudit(userId, action, details = {}, ip = 'unknown') {
  try {
    await db.collection('audit').add({
      userId,
      action,
      details,
      ip,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

export default admin;

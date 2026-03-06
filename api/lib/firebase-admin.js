// api/lib/firebase-admin.js
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!getApps().length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'xtaagc';
    
    admin.initializeApp({
      projectId: projectId
      // Application Default Credentials will be used automatically
    });
    
    console.log('✅ Firebase Admin initialized');
    console.log(`📁 Project ID: ${projectId}`);
  } catch (error) {
    console.error('❌ Firebase Admin error:', error);
    
    // Fallback
    try {
      admin.initializeApp();
      console.log('⚠️ Firebase Admin initialized with fallback');
    } catch (fallbackError) {
      console.error('❌ All initialization failed:', fallbackError);
    }
  }
}

// Helper: Verify token
export async function verifyToken(token) {
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Helper: Check if user is admin
export async function isAdmin(uid) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) return false;
    const role = userDoc.data().role;
    return role === 'admin' || role === 'super_admin';
  } catch {
    return false;
  }
}

// Helper: Check if user is super admin
export async function isSuperAdmin(uid) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) return false;
    return userDoc.data().role === 'super_admin';
  } catch {
    return false;
  }
}

// Helper: Log audit action
export async function logAudit(userId, action, details = {}, ip = 'unknown') {
  try {
    await admin.firestore().collection('audit').add({
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
export const auth = admin.auth();
export const db = admin.firestore();

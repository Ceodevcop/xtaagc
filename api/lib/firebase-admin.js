import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!getApps().length) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'xtaagc'
      // credential handled by ADC
    });  // ← Added missing closing parenthesis!
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin error:', error);
  }
}

export default admin;
export const auth = admin.auth();
export const db = admin.firestore();

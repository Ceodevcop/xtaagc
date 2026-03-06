// lib/firebase-admin.js - Updated for ADC (no keys needed!)
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin with Application Default Credentials
// Vercel automatically provides these credentials!
if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'xtaagc'
    });
    console.log('✅ Firebase Admin initialized with ADC');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

export default admin;

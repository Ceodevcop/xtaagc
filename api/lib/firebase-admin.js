// api/lib/firebase-admin.js
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin only once
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

// ============================================
// AUTHENTICATION HELPERS
// ============================================

/**
 * Verify a Firebase ID token
 * @param {string} token - Firebase ID token
 * @returns {Promise<Object>} { valid, decoded }
 */
export async function verifyToken(token) {
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Check if user has admin role
 * @param {string} uid - User ID
 * @returns {Promise<boolean>}
 */
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

/**
 * Check if user has super admin role
 * @param {string} uid - User ID
 * @returns {Promise<boolean>}
 */
export async function isSuperAdmin(uid) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) return false;
    return userDoc.data().role === 'super_admin';
  } catch {
    return false;
  }
}

/**
 * Check if user has investor role
 * @param {string} uid - User ID
 * @returns {Promise<boolean>}
 */
export async function isInvestor(uid) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) return false;
    return userDoc.data().role === 'investor';
  } catch {
    return false;
  }
}

/**
 * Check if user has client role
 * @param {string} uid - User ID
 * @returns {Promise<boolean>}
 */
export async function isClient(uid) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) return false;
    return userDoc.data().role === 'client';
  } catch {
    return false;
  }
}

/**
 * Get user role
 * @param {string} uid - User ID
 * @returns {Promise<string|null>}
 */
export async function getUserRole(uid) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) return null;
    return userDoc.data().role;
  } catch {
    return null;
  }
}

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Log an audit action
 * @param {string} userId - User performing action
 * @param {string} action - Action name
 * @param {Object} details - Additional details
 * @param {string} ip - IP address
 */
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

// ============================================
// FIRESTORE HELPERS
// ============================================

/**
 * Convert Firestore snapshot to array of objects with IDs
 * @param {Object} snapshot - Firestore query snapshot
 * @returns {Array} Array of document objects with IDs
 */
export function snapshotToArray(snapshot) {
  if (!snapshot || !snapshot.docs) return [];
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Convert Firestore document to object with ID
 * @param {Object} doc - Firestore document snapshot
 * @returns {Object|null} Document data with ID or null
 */
export function docToObject(doc) {
  if (!doc || !doc.exists) return null;
  return {
    id: doc.id,
    ...doc.data()
  };
}

/**
 * Format Firestore timestamp to ISO string
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string|null} ISO string or null
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
}

/**
 * Create paginated response
 * @param {Array} items - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Paginated response
 */
export function paginate(items, page = 1, limit = 20) {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    pagination: {
      total: items.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(items.length / limit),
      hasNext: endIndex < items.length,
      hasPrev: page > 1
    }
  };
}

/**
 * Create a Firestore batch operation
 * @param {Array} operations - Array of { type, ref, data }
 * @returns {Promise<void>}
 */
export async function batchWrite(operations) {
  const batch = admin.firestore().batch();
  
  operations.forEach(op => {
    switch (op.type) {
      case 'set':
        batch.set(op.ref, op.data, { merge: op.merge || false });
        break;
      case 'update':
        batch.update(op.ref, op.data);
        break;
      case 'delete':
        batch.delete(op.ref);
        break;
    }
  });
  
  return batch.commit();
}

// ============================================
// USER DATA HELPERS
// ============================================

/**
 * Get complete user data including Auth and Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Combined user data
 */
export async function getUserData(uid) {
  try {
    const [userRecord, userDoc] = await Promise.all([
      admin.auth().getUser(uid),
      admin.firestore().collection('users').doc(uid).get()
    ]);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      createdAt: userRecord.metadata.creationTime,
      lastLogin: userRecord.metadata.lastSignInTime,
      ...(userDoc.exists ? userDoc.data() : {})
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

/**
 * Set custom claims for user
 * @param {string} uid - User ID
 * @param {Object} claims - Custom claims
 * @returns {Promise<void>}
 */
export async function setCustomClaims(uid, claims) {
  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    
    // Update Firestore
    await admin.firestore().collection('users').doc(uid).update({
      ...claims,
      claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw error;
  }
}

// ============================================
// DATA VALIDATION HELPERS
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone to validate
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone) return true;
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone);
}

/**
 * Validate role
 * @param {string} role - Role to validate
 * @returns {boolean}
 */
export function isValidRole(role) {
  const validRoles = ['super_admin', 'admin', 'investor', 'client'];
  return validRoles.includes(role);
}

// ============================================
// EXPORTS
// ============================================

// Export admin instance
export default admin;

// Export Firebase services
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();
export const messaging = admin.messaging();

// Export FieldValue and Timestamp for convenience
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

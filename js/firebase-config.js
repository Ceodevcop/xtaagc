// ============================================
// TAAGC GLOBAL - FIREBASE CONFIGURATION
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOcCDPqRSlAMJJBEeNchTA1qO9tl9Nldw",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:android:0c54368d54e260cba98f0c"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized');
}

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence for Firestore
db.settings({ 
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED 
});

// Use device language for auth
auth.useDeviceLanguage();

// ============================================
// AUTH STATE OBSERVER
// ============================================
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ User logged in:', user.email);
        // Update last active timestamp
        db.collection('users').doc(user.uid).update({
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(() => {});
    } else {
        console.log('👋 User logged out');
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get current user's ID token
 * @returns {Promise<string>} Firebase ID token
 */
async function getCurrentUserToken() {
    const user = auth.currentUser;
    if (!user) return null;
    try {
        return await user.getIdToken(true);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
    return auth.currentUser !== null;
}

/**
 * Get current user's role from Firestore
 * @returns {Promise<string|null>}
 */
async function getUserRole() {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        return userDoc.exists ? userDoc.data().role : null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

/**
 * Check if current user has specific role
 * @param {string|string[]} roles - Role or array of roles to check
 * @returns {Promise<boolean>}
 */
async function hasRole(roles) {
    const userRole = await getUserRole();
    if (!userRole) return false;
    
    if (Array.isArray(roles)) {
        return roles.includes(userRole);
    }
    return userRole === roles;
}

/**
 * Logout current user
 * @returns {Promise<void>}
 */
async function logout() {
    try {
        await auth.signOut();
        console.log('✅ Logout successful');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('❌ Logout error:', error);
        throw error;
    }
}

// Export for use in other files
window.firebase = firebase;
window.auth = auth;
window.db = db;
window.storage = storage;
window.getCurrentUserToken = getCurrentUserToken;
window.isAuthenticated = isAuthenticated;
window.getUserRole = getUserRole;
window.hasRole = hasRole;
window.logout = logout;

console.log('✅ Firebase config loaded');

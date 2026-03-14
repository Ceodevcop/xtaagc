// ============================================
// TAAGC UNIVERSAL AUTHENTICATION
// Version: 3.0.0
// Works across ALL subdomains:
// - taagc.website
// - admin.taagc.website
// - staff.taagc.website  
// - investor.taagc.website
// - marketplace.taagc.website
// - pay.taagc.website
// - api.taagc.website
// - cdn.taagc.website
// ============================================

// ============================================
// 1. FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyAI1MrcP977UgRLQoePxl64JOSyj9v4WpI",
    authDomain: "xtaagc.firebaseapp.com",  // CRITICAL: Use project auth domain, NOT custom domains
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c"
};

// ============================================
// 2. INITIALIZE FIREBASE (ONCE)
// ============================================
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Enable persistence for offline support
db.enablePersistence()
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open - persistence disabled');
        } else if (err.code === 'unimplemented') {
            console.warn('Browser doesn\'t support persistence');
        }
    });

// ============================================
// 3. CROSS-DOMAIN PERSISTENCE
// ============================================
// This allows the same login to work across ALL subdomains
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log(`✅ TAAGC Auth active on: ${window.location.hostname}`);
    })
    .catch((error) => {
        console.error('Auth persistence error:', error);
    });

// ============================================
// 4. UNIVERSAL AUTH STATE HANDLER
// ============================================
auth.onAuthStateChanged(async (user) => {
    const currentDomain = window.location.hostname;
    const currentPath = window.location.pathname;
    
    // Store auth state in localStorage for cross-domain detection
    if (user) {
        // Get additional user data from Firestore
        let userData = {};
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                userData = userDoc.data();
            }
        } catch (error) {
            console.warn('Could not fetch user data:', error);
        }

        // Create unified auth object
        const authData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userData.fullName || userData.firstName || user.email.split('@')[0],
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            role: userData.role || 'user',
            lastLogin: new Date().toISOString(),
            domain: currentDomain,
            timestamp: Date.now()
        };
        
        // Store in multiple places for redundancy
        localStorage.setItem('taagc_auth', JSON.stringify(authData));
        sessionStorage.setItem('taagc_logged_in', 'true');
        sessionStorage.setItem('taagc_user', JSON.stringify(authData));
        
        // Set cookie for server-side detection (if needed)
        document.cookie = `taagc_auth=true; path=/; domain=.taagc.website; max-age=86400`;
        
        console.log(`✅ Authenticated on ${currentDomain}:`, user.email);
    } else {
        // Clear all auth data
        localStorage.removeItem('taagc_auth');
        sessionStorage.removeItem('taagc_logged_in');
        sessionStorage.removeItem('taagc_user');
        document.cookie = `taagc_auth=; path=/; domain=.taagc.website; max-age=0`;
        
        console.log(`🔒 Not authenticated on ${currentDomain}`);
    }
    
    // Trigger custom event for page-specific handlers
    window.dispatchEvent(new CustomEvent('taagc-auth-change', { 
        detail: { user: user ? user.toJSON() : null }
    }));
    
    // Update UI if function exists
    if (typeof updateAuthUI === 'function') {
        updateAuthUI(user);
    }
});

// ============================================
// 5. HELPER FUNCTIONS
// ============================================

/**
 * Check if user is logged in (synchronous)
 * @returns {boolean}
 */
window.isTaagcLoggedIn = function() {
    return !!(auth.currentUser || sessionStorage.getItem('taagc_logged_in') === 'true');
};

/**
 * Get current user data (synchronous)
 * @returns {object|null}
 */
window.getTaagcUser = function() {
    // Try to get from memory first
    if (auth.currentUser) {
        return {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName
        };
    }
    
    // Fallback to storage
    const stored = sessionStorage.getItem('taagc_user') || localStorage.getItem('taagc_auth');
    return stored ? JSON.parse(stored) : null;
};

/**
 * Require authentication - redirects if not logged in
 * @param {string} redirectTo - URL to redirect to for login
 * @returns {boolean}
 */
window.requireAuth = function(redirectTo = '/login') {
    if (!isTaagcLoggedIn()) {
        const currentPath = window.location.pathname;
        window.location.href = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        return false;
    }
    return true;
};

/**
 * Redirect if already logged in
 * @param {string} redirectTo - URL to redirect to if logged in
 */
window.redirectIfLoggedIn = function(redirectTo = '/') {
    if (isTaagcLoggedIn()) {
        window.location.href = redirectTo;
    }
};

/**
 * Logout user from ALL subdomains
 */
window.taagcLogout = async function() {
    try {
        await auth.signOut();
        
        // Clear all storage
        localStorage.removeItem('taagc_auth');
        sessionStorage.removeItem('taagc_logged_in');
        sessionStorage.removeItem('taagc_user');
        
        // Clear cookie
        document.cookie = `taagc_auth=; path=/; domain=.taagc.website; max-age=0`;
        
        // Redirect to home
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
};

/**
 * Get user's wallet addresses
 * @returns {Promise<object>}
 */
window.getUserWallet = async function() {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            return userDoc.data().wallet || {
                addresses: {
                    btc: 'Not configured',
                    eth: 'Not configured',
                    usdt: 'Not configured'
                },
                balances: {
                    btc: 0,
                    eth: 0,
                    usdt: 0,
                    usd: 0
                }
            };
        }
    } catch (error) {
        console.error('Error fetching wallet:', error);
    }
    return null;
};

/**
 * Update user profile
 * @param {object} data - User data to update
 * @returns {Promise}
 */
window.updateUserProfile = async function(data) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    return db.collection('users').doc(user.uid).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
};

/**
 * Get user's role
 * @returns {string}
 */
window.getUserRole = function() {
    const user = getTaagcUser();
    return user?.role || 'user';
};

/**
 * Check if user has specific role
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean}
 */
window.hasRole = function(roles) {
    const userRole = getUserRole();
    if (Array.isArray(roles)) {
        return roles.includes(userRole);
    }
    return userRole === roles;
};

// ============================================
// 6. CROSS-DOMAIN SYNC
// ============================================
// Listen for auth changes from other tabs/windows
window.addEventListener('storage', (event) => {
    if (event.key === 'taagc_auth') {
        if (event.newValue && !auth.currentUser) {
            // Another tab logged in - refresh this tab
            console.log('Auth changed in another tab, reloading...');
            window.location.reload();
        } else if (!event.newValue && auth.currentUser) {
            // Another tab logged out - logout this tab
            console.log('Logged out in another tab');
            auth.signOut();
        }
    }
});

// ============================================
// 7. EXPORT FOR MODULE USE (if needed)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        auth,
        db,
        isTaagcLoggedIn,
        getTaagcUser,
        requireAuth,
        taagcLogout,
        getUserWallet,
        updateUserProfile,
        getUserRole,
        hasRole
    };
}

// Log initialization
console.log(`🚀 TAAGC Auth loaded on ${window.location.hostname}${window.location.pathname}`);

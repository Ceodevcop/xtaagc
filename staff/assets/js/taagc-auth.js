// ============================================
// TAAGC UNIVERSAL AUTHENTICATION
// Works across ALL subdomains
// Include this file on EVERY page
// ============================================

// Firebase Configuration (SAME for ALL subdomains)
const firebaseConfig = {
    apiKey: "AIzaSyAI1MrcP977UgRLQoePxl64JOSyj9v4WpI",
    authDomain: "xtaagc.firebaseapp.com",  // CRITICAL: Use project auth domain, NOT custom domain
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c"
};

// Initialize Firebase (if not already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Set persistence to LOCAL to share across ALL subdomains
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('✅ Shared auth active across all subdomains');
    })
    .catch((error) => {
        console.error('Auth persistence error:', error);
    });

// ============================================
// UNIVERSAL AUTH STATE HANDLER
// Runs on EVERY page across ALL subdomains
// ============================================
auth.onAuthStateChanged(async (user) => {
    const currentDomain = window.location.hostname;
    const currentPath = window.location.pathname;
    
    // Store auth state in localStorage for cross-domain detection
    if (user) {
        const authData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            lastLogin: new Date().toISOString(),
            domain: currentDomain
        };
        localStorage.setItem('taagc_auth', JSON.stringify(authData));
        sessionStorage.setItem('taagc_logged_in', 'true');
        
        console.log(`✅ Authenticated on ${currentDomain}:`, user.email);
    } else {
        localStorage.removeItem('taagc_auth');
        sessionStorage.removeItem('taagc_logged_in');
        console.log(`🔒 Not authenticated on ${currentDomain}`);
    }
    
    // Update UI elements if they exist
    updateAuthUI(user);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Update UI based on auth state
function updateAuthUI(user) {
    // Update auth status badge (if exists)
    const authBadge = document.getElementById('auth-badge');
    if (authBadge) {
        if (user) {
            authBadge.innerHTML = `🔓 ${window.location.hostname} · ${user.email}`;
            authBadge.style.background = '#d4edda';
            authBadge.style.color = '#155724';
        } else {
            authBadge.innerHTML = `🔒 ${window.location.hostname} · not logged in`;
            authBadge.style.background = '#f8d7da';
            authBadge.style.color = '#721c24';
        }
    }
    
    // Update user menu (if exists)
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        if (user) {
            const displayName = user.displayName || user.email.split('@')[0];
            const initial = displayName.charAt(0).toUpperCase();
            userMenu.innerHTML = `
                <div class="user-badge">
                    <div class="user-avatar">${initial}</div>
                    <div class="user-info">
                        <div class="user-name">${displayName}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                    <button class="logout-btn" onclick="taagcLogout()">Logout</button>
                </div>
            `;
        } else {
            userMenu.innerHTML = `
                <div class="auth-buttons">
                    <a href="/login" class="btn-login">Login</a>
                    <a href="/register" class="btn-signup">Sign Up</a>
                </div>
            `;
        }
    }
}

// Universal logout function
window.taagcLogout = async function() {
    try {
        await auth.signOut();
        localStorage.removeItem('taagc_auth');
        sessionStorage.removeItem('taagc_logged_in');
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Check if user is logged in (synchronous)
window.isTaagcLoggedIn = function() {
    return sessionStorage.getItem('taagc_logged_in') === 'true' || auth.currentUser !== null;
};

// Get current user data
window.getTaagcUser = function() {
    const authData = localStorage.getItem('taagc_auth');
    return authData ? JSON.parse(authData) : null;
};

// Redirect if not authenticated
window.requireAuth = function(redirectTo = '/login') {
    if (!isTaagcLoggedIn()) {
        window.location.href = `${redirectTo}?redirect=${window.location.pathname}`;
        return false;
    }
    return true;
};

// ============================================
// CROSS-DOMAIN SYNC
// Check for auth from other subdomains
// ============================================
window.addEventListener('load', () => {
    // If we have auth in localStorage but no current user, try to restore
    const storedAuth = localStorage.getItem('taagc_auth');
    if (storedAuth && !auth.currentUser) {
        console.log('Found stored auth from another subdomain');
        // Wait for Firebase to auto-restore the session
        setTimeout(() => {
            if (!auth.currentUser) {
                console.log('Session expired, please login again');
            }
        }, 2000);
    }
});

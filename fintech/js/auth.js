// Login functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const googleBtn = document.getElementById('googleLogin');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleLogin);
    }

    const appleBtn = document.getElementById('appleLogin');
    if (appleBtn) {
        appleBtn.addEventListener('click', handleAppleLogin);
    }
});

// Handle email/password login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span> Signing in...';
    
    try {
        // Set persistence based on remember me
        const persistence = rememberMe 
            ? firebase.auth.Auth.Persistence.LOCAL 
            : firebase.auth.Auth.Persistence.SESSION;
        
        await auth.setPersistence(persistence);
        
        // Sign in user
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Update last login in Firestore
        await db.collection(COLLECTIONS.USERS).doc(userCredential.user.uid).update({
            'metadata.lastLogin': firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Login successful!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard/';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Login failed. Please try again.';
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'Invalid email or password.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
        }
        
        showToast(errorMessage, 'error');
        
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
}

// Handle Google login
async function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    try {
        const result = await auth.signInWithPopup(provider);
        
        // Check if user exists in Firestore
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(result.user.uid).get();
        
        if (!userDoc.exists) {
            // Create new user document
            await db.collection(COLLECTIONS.USERS).doc(result.user.uid).set({
                email: result.user.email,
                profile: {
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                },
                kyc: {
                    level: 0,
                    status: 'pending',
                    documents: []
                },
                preferences: {
                    language: 'en',
                    currency: 'USD',
                    notifications: {
                        email: true,
                        push: true,
                        sms: false
                    }
                },
                metadata: {
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }
            });
            
            // Create default account
            await db.collection(COLLECTIONS.USERS).doc(result.user.uid)
                .collection(COLLECTIONS.ACCOUNTS).add({
                    type: 'checking',
                    currency: 'USD',
                    balance: 0,
                    status: 'active',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
        }
        
        showToast('Login successful!', 'success');
        window.location.href = '/dashboard/';
        
    } catch (error) {
        console.error('Google login error:', error);
        showToast('Google login failed. Please try again.', 'error');
    }
}

// Handle Apple login
async function handleAppleLogin() {
    const provider = new firebase.auth.OAuthProvider('apple.com');
    
    try {
        const result = await auth.signInWithPopup(provider);
        showToast('Login successful!', 'success');
        window.location.href = '/dashboard/';
    } catch (error) {
        console.error('Apple login error:', error);
        showToast('Apple login failed. Please try again.', 'error');
    }
}

// Handle logout
async function handleLogout() {
    try {
        await auth.signOut();
        showToast('Logged out successfully', 'success');
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

// Add logout listeners
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const sidebarLogout = document.getElementById('sidebarLogout');
    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', handleLogout);
    }
});

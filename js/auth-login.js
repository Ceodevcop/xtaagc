// js/auth-login.js - Login form handler with null checks

function initializeLoginHandler() {
    const loginForm = document.getElementById('loginFormElement');
    
    if (!loginForm) {
        console.warn('Login form not found, retrying in 100ms...');
        setTimeout(initializeLoginHandler, 100);
        return;
    }
    
    console.log('Login form found, attaching handler...');
    
    // Remove any existing listeners to prevent duplicates
    const newForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newForm, loginForm);
    
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('loginBtn');
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const rememberInput = document.getElementById('rememberMe');
        
        // Validate elements exist
        if (!btn || !emailInput || !passwordInput) {
            showAlert('Form elements not found', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberInput ? rememberInput.checked : false;
        
        if (!email || !password) {
            showAlert('Please enter email and password', 'error');
            return;
        }
        
        // Show loading state
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Logging in...';
        btn.disabled = true;
        
        try {
            // Check if auth is initialized
            if (!window.auth) {
                throw new Error('Authentication not initialized. Please refresh the page.');
            }
            
            // Sign in to Firebase
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Login successful:', user.uid);
            
            // Get user data from Firestore
            let userData = { 
                uid: user.uid, 
                email: user.email 
            };
            
            // Check companies collection
            if (!window.db) {
                throw new Error('Database not initialized');
            }
            
            const companyDoc = await window.db.collection('companies').doc(user.uid).get();
            
            if (companyDoc.exists) {
                userData.userType = 'company';
                userData.accountType = companyDoc.data().accountType || 'client';
                userData.name = companyDoc.data().name || companyDoc.data().companyName || 'Company';
            } else {
                // Check individuals collection
                const indDoc = await window.db.collection('individuals').doc(user.uid).get();
                
                if (indDoc.exists) {
                    userData.userType = 'individual';
                    userData.accountType = indDoc.data().accountType || 'shopper';
                    userData.name = indDoc.data().name || indDoc.data().fullName || 'User';
                } else {
                    // Fallback - create basic user record
                    userData.userType = 'individual';
                    userData.accountType = 'shopper';
                    userData.name = user.email.split('@')[0] || 'User';
                    
                    // Save to Firestore for future logins
                    try {
                        await window.db.collection('users').doc(user.uid).set({
                            email: user.email,
                            uid: user.uid,
                            userType: 'individual',
                            accountType: 'shopper',
                            createdAt: new Date().toISOString()
                        });
                    } catch (e) {
                        console.warn('Could not save user record:', e);
                    }
                }
            }
            
            // Save to storage
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('taagc_user', JSON.stringify(userData));
            
            // Show success message
            showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect based on user type
            setTimeout(() => {
                if (userData.userType === 'company') {
                    window.location.href = '/dashboards/company.html';
                } else {
                    const dashboards = {
                        shopper: '/dashboards/shopper.html',
                        investor: '/dashboards/investor.html',
                        professional: '/dashboards/professional.html'
                    };
                    window.location.href = dashboards[userData.accountType] || '/dashboards/shopper.html';
                }
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Show error message
            let errorMessage = error.message;
            if (error.code === 'auth/user-not-found') errorMessage = 'No account found with this email';
            if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
            if (error.code === 'auth/too-many-requests') errorMessage = 'Too many failed attempts. Try again later.';
            if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
            if (error.code === 'auth/network-request-failed') errorMessage = 'Network error. Check your connection.';
            
            showAlert(errorMessage, 'error');
            
            // Reset button
            btn.innerHTML = originalText || 'Login to Account';
            btn.disabled = false;
        }
    });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLoginHandler);
} else {
    initializeLoginHandler();
    }

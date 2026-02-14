// js/auth-login.js - Login form handler

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginFormElement');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('loginBtn');
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Show loading state
        btn.innerHTML = '<span class="loading"></span> Logging in...';
        btn.disabled = true;
        
        try {
            // Sign in to Firebase
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Get user data from Firestore
            let userData = { 
                uid: user.uid, 
                email: user.email 
            };
            
            // Check companies collection
            const companyDoc = await window.db.collection('companies').doc(user.uid).get();
            
            if (companyDoc.exists) {
                userData.userType = 'company';
                userData.accountType = companyDoc.data().accountType || 'client';
                userData.name = companyDoc.data().name || companyDoc.data().companyName;
            } else {
                // Check individuals collection
                const indDoc = await window.db.collection('individuals').doc(user.uid).get();
                
                if (indDoc.exists) {
                    userData.userType = 'individual';
                    userData.accountType = indDoc.data().accountType || 'shopper';
                    userData.name = indDoc.data().name;
                } else {
                    // Fallback - create basic user record
                    userData.userType = 'individual';
                    userData.accountType = 'shopper';
                    userData.name = user.email.split('@')[0];
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
            
            showAlert(errorMessage, 'error');
            
            // Reset button
            btn.innerHTML = 'Login to Account';
            btn.disabled = false;
        }
    });
});

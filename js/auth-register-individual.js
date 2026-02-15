// js/auth-register-individual.js - Individual registration handler

document.addEventListener('DOMContentLoaded', function() {
    const individualForm = document.getElementById('individualForm');
    
    if (!individualForm) return;
    
    individualForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('indBtn');
        const email = document.getElementById('indEmail').value;
        const password = document.getElementById('indPass').value;
        const confirmPassword = document.getElementById('indPass2').value;
        const accountType = document.getElementById('indType').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }
        
        // Show loading state
        btn.innerHTML = '<span class="loading"></span> Creating Account...';
        btn.disabled = true;
        
        try {
            // Create user in Firebase Auth
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Save individual data to Firestore
            await window.db.collection('individuals').doc(user.uid).set({
                name: document.getElementById('indName').value,
                fullName: document.getElementById('indName').value,
                email: email,
                phone: document.getElementById('indPhone').value,
                accountType: accountType,
                createdAt: new Date().toISOString(),
                uid: user.uid,
                userType: 'individual'
            });
            
            // Auto login after registration
            const userData = {
                uid: user.uid,
                email: email,
                userType: 'individual',
                accountType: accountType,
                name: document.getElementById('indName').value
            };
            
            localStorage.setItem('taagc_user', JSON.stringify(userData));
            
            // Show success message
            showAlert('Account created! Redirecting...', 'success');
            
            // Redirect to appropriate dashboard
            const dashboards = {
                shopper: '/dashboards/shopper.html',
                investor: '/dashboards/investor.html',
                professional: '/dashboards/professional.html'
            };
            
            setTimeout(() => {
                window.location.href = dashboards[accountType] || '/dashboards/shopper.html';
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            
            // Show error message
            let errorMessage = error.message;
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please login instead.';
            }
            
            showAlert(errorMessage, 'error');
            
            // Reset button
            btn.innerHTML = 'Create Account';
            btn.disabled = false;
        }
    });
});

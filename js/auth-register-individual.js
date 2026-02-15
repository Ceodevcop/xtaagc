// js/auth-register-individual.js - Individual registration handler with null checks

function initializeIndividualRegister() {
    const individualForm = document.getElementById('individualForm');
    
    if (!individualForm) {
        console.warn('Individual registration form not found, retrying in 100ms...');
        setTimeout(initializeIndividualRegister, 100);
        return;
    }
    
    console.log('Individual registration form found, attaching handler...');
    
    // Remove any existing listeners
    const newForm = individualForm.cloneNode(true);
    individualForm.parentNode.replaceChild(newForm, individualForm);
    
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get all form elements
        const btn = document.getElementById('indBtn');
        const nameInput = document.getElementById('indName');
        const emailInput = document.getElementById('indEmail');
        const phoneInput = document.getElementById('indPhone');
        const typeSelect = document.getElementById('indType');
        const passInput = document.getElementById('indPass');
        const pass2Input = document.getElementById('indPass2');
        
        // Validate all elements exist
        if (!btn || !nameInput || !emailInput || !phoneInput || !typeSelect || !passInput || !pass2Input) {
            showAlert('Form elements not found. Please refresh the page.', 'error');
            return;
        }
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const accountType = typeSelect.value;
        const password = passInput.value;
        const confirmPassword = pass2Input.value;
        
        // Validate inputs
        if (!name || !email || !phone || !password || !confirmPassword) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Creating Account...';
        btn.disabled = true;
        
        try {
            // Check if auth is initialized
            if (!window.auth) {
                throw new Error('Authentication not initialized. Please refresh the page.');
            }
            
            // Create user in Firebase Auth
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Individual user created:', user.uid);
            
            // Check if db is initialized
            if (!window.db) {
                throw new Error('Database not initialized');
            }
            
            // Save individual data to Firestore
            await window.db.collection('individuals').doc(user.uid).set({
                name: name,
                fullName: name,
                email: email,
                phone: phone,
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
                name: name
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
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }
            
            showAlert(errorMessage, 'error');
            
            // Reset button
            btn.innerHTML = originalText || 'Create Account';
            btn.disabled = false;
        }
    });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIndividualRegister);
} else {
    initializeIndividualRegister();
                }

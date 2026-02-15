// js/auth-register-company.js - Company registration handler with null checks

function initializeCompanyRegister() {
    const companyForm = document.getElementById('companyForm');
    
    if (!companyForm) {
        console.warn('Company registration form not found, retrying in 100ms...');
        setTimeout(initializeCompanyRegister, 100);
        return;
    }
    
    console.log('Company registration form found, attaching handler...');
    
    // Remove any existing listeners
    const newForm = companyForm.cloneNode(true);
    companyForm.parentNode.replaceChild(newForm, companyForm);
    
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get all form elements
        const btn = document.getElementById('compBtn');
        const nameInput = document.getElementById('compName');
        const regInput = document.getElementById('compReg');
        const emailInput = document.getElementById('compEmail');
        const phoneInput = document.getElementById('compPhone');
        const passInput = document.getElementById('compPass');
        const pass2Input = document.getElementById('compPass2');
        
        // Validate all elements exist
        if (!btn || !nameInput || !regInput || !emailInput || !phoneInput || !passInput || !pass2Input) {
            showAlert('Form elements not found. Please refresh the page.', 'error');
            return;
        }
        
        const name = nameInput.value.trim();
        const reg = regInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passInput.value;
        const confirmPassword = pass2Input.value;
        
        // Validate inputs
        if (!name || !reg || !email || !phone || !password || !confirmPassword) {
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
        
        // Validate company email (no personal domains)
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('@gmail') || lowerEmail.includes('@yahoo') || 
            lowerEmail.includes('@hotmail') || lowerEmail.includes('@outlook')) {
            showAlert('Please use your company email address', 'error');
            return;
        }
        
        // Show loading state
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Registering...';
        btn.disabled = true;
        
        try {
            // Check if auth is initialized
            if (!window.auth) {
                throw new Error('Authentication not initialized. Please refresh the page.');
            }
            
            // Create user in Firebase Auth
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Company user created:', user.uid);
            
            // Check if db is initialized
            if (!window.db) {
                throw new Error('Database not initialized');
            }
            
            // Save company data to Firestore
            await window.db.collection('companies').doc(user.uid).set({
                name: name,
                companyName: name,
                regNumber: reg,
                email: email,
                phone: phone,
                accountType: 'client',
                status: 'pending',
                createdAt: new Date().toISOString(),
                uid: user.uid,
                userType: 'company'
            });
            
            // Auto login after registration
            const userData = {
                uid: user.uid,
                email: email,
                userType: 'company',
                accountType: 'client',
                name: name
            };
            
            localStorage.setItem('taagc_user', JSON.stringify(userData));
            
            // Show success message
            showAlert('Registration submitted! Redirecting...', 'success');
            
            // Redirect to company dashboard
            setTimeout(() => {
                window.location.href = '/dashboards/company.html';
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
            btn.innerHTML = originalText || 'Register Company';
            btn.disabled = false;
        }
    });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCompanyRegister);
} else {
    initializeCompanyRegister();
    }

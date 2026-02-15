// js/auth-register-company.js - Company registration handler

document.addEventListener('DOMContentLoaded', function() {
    const companyForm = document.getElementById('companyForm');
    
    if (!companyForm) return;
    
    companyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('compBtn');
        const email = document.getElementById('compEmail').value;
        const password = document.getElementById('compPass').value;
        const confirmPassword = document.getElementById('compPass2').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }
        
        // Validate company email (no personal domains)
        if (email.includes('@gmail') || email.includes('@yahoo') || 
            email.includes('@hotmail') || email.includes('@outlook')) {
            showAlert('Please use your company email address', 'error');
            return;
        }
        
        // Show loading state
        btn.innerHTML = '<span class="loading"></span> Registering...';
        btn.disabled = true;
        
        try {
            // Create user in Firebase Auth
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Save company data to Firestore
            await window.db.collection('companies').doc(user.uid).set({
                name: document.getElementById('compName').value,
                companyName: document.getElementById('compName').value,
                regNumber: document.getElementById('compReg').value,
                email: email,
                phone: document.getElementById('compPhone').value,
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
                name: document.getElementById('compName').value
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
            }
            
            showAlert(errorMessage, 'error');
            
            // Reset button
            btn.innerHTML = 'Register Company';
            btn.disabled = false;
        }
    });
});

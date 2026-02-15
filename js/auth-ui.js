// js/auth-ui.js - UI helper functions with null checks

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) {
        console.warn('Alert element not found');
        return;
    }
    
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        if (alertDiv) {
            alertDiv.innerHTML = '';
            alertDiv.className = 'alert';
        }
    }, 5000);
}

// Switch between login and register tabs
function showTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn && btn.dataset) {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        }
    });
    
    // Show/hide forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginLink = document.getElementById('loginLinkText');
    const registerLink = document.getElementById('registerLinkText');
    
    if (loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
    if (registerForm) registerForm.style.display = tab === 'register' ? 'block' : 'none';
    if (loginLink) loginLink.style.display = tab === 'login' ? 'block' : 'none';
    if (registerLink) registerLink.style.display = tab === 'register' ? 'block' : 'none';
}

// Switch between company and individual registration
function setRegisterType(type) {
    // Update type buttons
    document.querySelectorAll('.company-type-btn').forEach(btn => {
        if (btn && btn.dataset) {
            btn.classList.toggle('active', btn.dataset.registerType === type);
        }
    });
    
    // Show/hide registration forms
    const companyReg = document.getElementById('companyRegister');
    const individualReg = document.getElementById('individualRegister');
    
    if (companyReg) companyReg.style.display = type === 'company' ? 'block' : 'none';
    if (individualReg) individualReg.style.display = type === 'individual' ? 'block' : 'none';
}

// Forgot password handler
async function handleForgotPassword(e) {
    if (e) e.preventDefault();
    
    const email = prompt('Enter your email address:');
    if (!email) return;
    
    try {
        if (!window.auth) {
            throw new Error('Authentication not initialized');
        }
        await window.auth.sendPasswordResetEmail(email);
        showAlert('Password reset email sent! Check your inbox.', 'success');
    } catch (error) {
        console.error('Forgot password error:', error);
        showAlert(error.message || 'Failed to send reset email', 'error');
    }
}

// Make functions globally available
window.showAlert = showAlert;
window.showTab = showTab;
window.setRegisterType = setRegisterType;
window.handleForgotPassword = handleForgotPassword;

// Initialize event listeners when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing auth UI...');
    
    // Tab buttons
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.dataset && this.dataset.tab) {
                showTab(this.dataset.tab);
            }
        });
    });
    
    // Register type buttons
    document.querySelectorAll('.company-type-btn[data-register-type]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.dataset && this.dataset.registerType) {
                setRegisterType(this.dataset.registerType);
            }
        });
    });
    
    // Forgot password link
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', handleForgotPassword);
    } else {
        console.warn('Forgot password link not found');
    }
    
    // Show register link
    const showRegisterLink = document.getElementById('showRegisterLink');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            showTab('register');
        });
    }
    
    // Show login link
    const showLoginLink = document.getElementById('showLoginLink');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showTab('login');
        });
    }
    
    // Set default active tab if none active
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) {
        const loginTab = document.querySelector('[data-tab="login"]');
        if (loginTab) {
            loginTab.classList.add('active');
            showTab('login');
        }
    }
});

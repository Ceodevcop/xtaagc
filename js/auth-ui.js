// js/auth-ui.js - UI helper functions

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;
    
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertDiv.innerHTML = '';
        alertDiv.className = 'alert';
    }, 5000);
}

// Switch between login and register tabs
function showTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Show/hide forms
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    
    // Update toggle links
    document.getElementById('loginLinkText').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerLinkText').style.display = tab === 'register' ? 'block' : 'none';
}

// Switch between company and individual registration
function setRegisterType(type) {
    // Update type buttons
    document.querySelectorAll('.company-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.registerType === type);
    });
    
    // Show/hide registration forms
    document.getElementById('companyRegister').style.display = type === 'company' ? 'block' : 'none';
    document.getElementById('individualRegister').style.display = type === 'individual' ? 'block' : 'none';
}

// Forgot password handler
async function handleForgotPassword(e) {
    e.preventDefault();
    const email = prompt('Enter your email address:');
    
    if (!email) return;
    
    try {
        await window.auth.sendPasswordResetEmail(email);
        showAlert('Password reset email sent! Check your inbox.', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Make functions globally available
window.showAlert = showAlert;
window.showTab = showTab;
window.setRegisterType = setRegisterType;
window.handleForgotPassword = handleForgotPassword;

// Set up event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Tab buttons
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });
    
    // Register type buttons
    document.querySelectorAll('.company-type-btn[data-register-type]').forEach(btn => {
        btn.addEventListener('click', () => setRegisterType(btn.dataset.registerType));
    });
    
    // Forgot password link
    document.getElementById('forgotPasswordLink')?.addEventListener('click', handleForgotPassword);
    
    // Show register link
    document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showTab('register');
    });
    
    // Show login link
    document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showTab('login');
    });
});

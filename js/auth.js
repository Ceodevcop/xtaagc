// js/auth.js
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    setTimeout(() => {
        alertDiv.innerHTML = '';
        alertDiv.className = 'alert';
    }, 5000);
}

function showTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
    if (registerForm) registerForm.style.display = tab === 'register' ? 'block' : 'none';
    
    const loginLink = document.getElementById('loginLinkText');
    const registerLink = document.getElementById('registerLinkText');
    if (loginLink) loginLink.style.display = tab === 'login' ? 'block' : 'none';
    if (registerLink) registerLink.style.display = tab === 'register' ? 'block' : 'none';
}

function setRegisterType(type) {
    document.querySelectorAll('#registerForm .tab-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('companyRegister').style.display = type === 'company' ? 'block' : 'none';
    document.getElementById('individualRegister').style.display = type === 'individual' ? 'block' : 'none';
}

function forgotPassword(e) {
    e.preventDefault();
    const email = prompt('Enter your email address:');
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => showAlert('Password reset email sent!', 'success'))
            .catch(error => showAlert(error.message, 'error'));
    }
}

// Check if already logged in
function checkAuthRedirect() {
    const user = localStorage.getItem('taagc_user') || sessionStorage.getItem('taagc_user');
    if (user && window.location.pathname === '/register.html') {
        const userData = JSON.parse(user);
        if (userData.userType === 'company') {
            window.location.href = '/dashboards/company.html';
        } else {
            const dash = {
                shopper: '/dashboards/shopper.html',
                investor: '/dashboards/investor.html',
                professional: '/dashboards/professional.html'
            };
            window.location.href = dash[userData.accountType] || '/dashboards/shopper.html';
        }
    }
}

// Make functions global
window.showAlert = showAlert;
window.showTab = showTab;
window.setRegisterType = setRegisterType;
window.forgotPassword = forgotPassword;
window.checkAuthRedirect = checkAuthRedirect;

// Run on page load
document.addEventListener('DOMContentLoaded', checkAuthRedirect);

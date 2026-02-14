// js/dashboard-auth.js - FIXED
(function() {
    // Check if user is logged in
    const user = localStorage.getItem('taagc_user') || sessionStorage.getItem('taagc_user');
    
    if (!user) {
        console.log('No user found, redirecting to login');
        window.location.href = '/register.html';
        return;
    }
    
    try {
        const userData = JSON.parse(user);
        const currentPage = window.location.pathname;
        
        console.log('User authenticated:', userData.email);
        
        // Define valid dashboards
        const validDashboards = {
            'company': '/dashboards/company.html',
            'shopper': '/dashboards/shopper.html',
            'investor': '/dashboards/investor.html',
            'professional': '/dashboards/professional.html'
        };
        
        // Check if user is on correct dashboard
        if (userData.userType === 'company' && !currentPage.includes('company')) {
            window.location.href = validDashboards.company;
        } else if (userData.userType === 'individual') {
            const expectedDashboard = validDashboards[userData.accountType];
            if (expectedDashboard && !currentPage.includes(userData.accountType)) {
                window.location.href = expectedDashboard;
            }
        }
    } catch (e) {
        console.error('Auth error:', e);
        localStorage.removeItem('taagc_user');
        sessionStorage.removeItem('taagc_user');
        window.location.href = '/register.html';
    }
    
    // Make logout function globally available
    window.logout = function() {
        // Clear storage
        localStorage.removeItem('taagc_user');
        sessionStorage.removeItem('taagc_user');
        
        // Sign out from Firebase
        if (window.auth) {
            window.auth.signOut().catch(console.error);
        }
        
        // Redirect to login
        window.location.href = '/register.html';
    };
    
    // Auto-attach to logout button
    document.addEventListener('DOMContentLoaded', function() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.logout();
            });
        }
    });
})();

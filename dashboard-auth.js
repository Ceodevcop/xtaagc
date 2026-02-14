// dashboard-auth.js - Include this in ALL dashboard pages
// Add this line to the top of shopper-dashboard.html, investor-dashboard.html, professional-dashboard.html, company-dashboard.html

(function() {
    // Check if user is logged in
    const user = localStorage.getItem('taagc_user') || sessionStorage.getItem('taagc_user');
    
    if (!user) {
        // Not logged in - redirect to register page
        window.location.href = '/register.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }
    
    // Parse user data
    const userData = JSON.parse(user);
    
    // Check if user type matches dashboard
    const currentPage = window.location.pathname;
    const userType = userData.userType;
    const accountType = userData.accountType;
    
    // Define valid dashboard for each user type
    const validDashboards = {
        'company': '/company-dashboard.html',
        'shopper': '/shopper-dashboard.html',
        'investor': '/investor-dashboard.html',
        'professional': '/professional-dashboard.html'
    };
    
    // If user is on wrong dashboard, redirect to correct one
    if (userType === 'company' && currentPage !== validDashboards.company) {
        window.location.href = validDashboards.company;
    } else if (userType === 'individual') {
        const expectedDashboard = validDashboards[accountType];
        if (expectedDashboard && currentPage !== expectedDashboard) {
            window.location.href = expectedDashboard;
        }
    }
    
    // Make logout function globally available
    window.logout = function() {
        // Clear all storage
        localStorage.removeItem('taagc_user');
        sessionStorage.removeItem('taagc_user');
        
        // Sign out from Firebase if available
        if (window.firebase && firebase.auth) {
            firebase.auth().signOut().catch(console.error);
        }
        
        // Redirect to login
        window.location.href = '/register.html';
    };
    
    // Add logout button handler if logout button exists
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

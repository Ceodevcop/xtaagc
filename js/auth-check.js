// js/auth-check.js - Check if user is already logged in

(function() {
    // Check if user is already logged in
    const user = localStorage.getItem('taagc_user') || sessionStorage.getItem('taagc_user');
    
    // Only redirect if on register page and already logged in
    if (user && window.location.pathname === '/register.html') {
        try {
            const userData = JSON.parse(user);
            
            // Redirect to appropriate dashboard
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
        } catch (e) {
            // Invalid user data, clear it
            localStorage.removeItem('taagc_user');
            sessionStorage.removeItem('taagc_user');
        }
    }
})();

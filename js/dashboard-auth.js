// js/dashboard-auth.js
(function() {
    const user = localStorage.getItem('taagc_user') || sessionStorage.getItem('taagc_user');
    
    if (!user) {
        window.location.href = '/register.html';
        return;
    }
    
    try {
        const userData = JSON.parse(user);
        const currentPage = window.location.pathname;
        
        const validDashboards = {
            'company': '/dashboards/company.html',
            'shopper': '/dashboards/shopper.html',
            'investor': '/dashboards/investor.html',
            'professional': '/dashboards/professional.html'
        };
        
        if (userData.userType === 'company' && !currentPage.includes('company')) {
            window.location.href = validDashboards.company;
        } else if (userData.userType === 'individual' && !currentPage.includes(userData.accountType)) {
            window.location.href = validDashboards[userData.accountType] || validDashboards.shopper;
        }
    } catch (e) {
        localStorage.removeItem('taagc_user');
        sessionStorage.removeItem('taagc_user');
        window.location.href = '/register.html';
    }
    
    window.logout = function() {
        localStorage.removeItem('taagc_user');
        sessionStorage.removeItem('taagc_user');
        if (firebase && firebase.auth) firebase.auth().signOut();
        window.location.href = '/register.html';
    };
})();

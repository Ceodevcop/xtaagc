// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User signed in:', user.uid);
        
        // Update UI for logged in state
        document.body.classList.add('user-authenticated');
        
        // Store user info in session
        sessionStorage.setItem('userId', user.uid);
        sessionStorage.setItem('userEmail', user.email);
        
        // Load user data
        loadUserData(user.uid);
    } else {
        // User is signed out
        console.log('User signed out');
        document.body.classList.remove('user-authenticated');
        sessionStorage.clear();
        
        // Redirect to login if on protected page
        const protectedPages = ['/dashboard/', '/cards/', '/transactions/', '/profile/'];
        const currentPath = window.location.pathname;
        
        if (protectedPages.some(page => currentPath.includes(page))) {
            window.location.href = '/login/';
        }
    }
});

// Load user data from Firestore
async function loadUserData(userId) {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
        if (userDoc.exists) {
            sessionStorage.setItem('userData', JSON.stringify(userDoc.data()));
            
            // Update UI with user data
            updateUserInterface(userDoc.data());
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Update UI with user data
function updateUserInterface(userData) {
    // Update user avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        const initials = userData.profile?.firstName?.charAt(0) + userData.profile?.lastName?.charAt(0);
        userAvatar.textContent = initials || 'U';
    }
    
    // Update user name
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = `${userData.profile?.firstName} ${userData.profile?.lastName}`;
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

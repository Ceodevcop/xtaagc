/* ============================================
   TAAGC ADMIN - MASTER JS FILE - FIXED VERSION
   Version: 3.0.0
   ============================================ */

// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyCOcCDPqRSlAMJJBEeNchTA1qO9tl9Nldw",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.appspot.com",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c"
};

// Initialize Firebase (only if not already initialized)
if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized in admin.js');
}

// ============================================
// GLOBAL CONFIGURATION
// ============================================
const TAAGC = {
    version: '3.0.0',
    
    config: {
        apiUrl: '/api',
        wsUrl: 'wss://api.taagc.website/ws',
        appName: 'TAAGC Global',
        dateFormat: 'MM/DD/YYYY',
        itemsPerPage: 20,
        sessionTimeout: 30 * 60 * 1000,
    },
    
    currentUser: null,
    userRole: null,
    userData: null,
    sessionTimer: null,
    
    // ============================================
    // AUTHENTICATION - FIXED VERSION
    // ============================================
    auth: {
        // Exchange custom token for ID token
        async exchangeToken(customToken) {
            try {
                console.log('1. Exchanging custom token for ID token...');
                const userCredential = await firebase.auth().signInWithCustomToken(customToken);
                console.log('2. Signed in with custom token, user:', userCredential.user.uid);
                
                // Get fresh ID token
                const idToken = await userCredential.user.getIdToken(true);
                console.log('3. Got ID token, length:', idToken.length);
                
                return { 
                    success: true, 
                    idToken, 
                    user: userCredential.user 
                };
            } catch (error) {
                console.error('Token exchange error:', error);
                return { success: false, error: error.message };
            }
        },

        // Check if authenticated
        isAuthenticated() {
            return !!localStorage.getItem('adminToken') || !!sessionStorage.getItem('adminToken');
        },
        
        // Get current user from storage
        getCurrentUser() {
            if (TAAGC.currentUser) return TAAGC.currentUser;
            
            const userStr = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
            if (userStr) {
                try {
                    TAAGC.currentUser = JSON.parse(userStr);
                    TAAGC.userRole = TAAGC.currentUser.role;
                    TAAGC.userData = TAAGC.currentUser;
                    return TAAGC.currentUser;
                } catch (e) {
                    console.error('Error parsing user:', e);
                    return null;
                }
            }
            return null;
        },
        
        // Check if super admin
        isSuperAdmin() {
            const user = this.getCurrentUser();
            return user && user.role === 'super_admin';
        },
        
        // Check if admin
        isAdmin() {
            const user = this.getCurrentUser();
            return user && ['admin', 'super_admin'].includes(user.role);
        },
        
        // Login - FIXED VERSION
        async login(email, password, rememberMe = true) {
            try {
                console.log('Login: Sending request to /api/auth/login');
                
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('Login response:', data);

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                // Exchange custom token for ID token
                console.log('Exchanging custom token...');
                const exchangeResult = await this.exchangeToken(data.token);
                
                if (!exchangeResult.success) {
                    throw new Error('Failed to authenticate session: ' + exchangeResult.error);
                }

                // Store the ID token
                if (rememberMe) {
                    localStorage.setItem('adminToken', exchangeResult.idToken);
                    localStorage.setItem('adminUser', JSON.stringify(data.user));
                    console.log('Token saved to localStorage');
                } else {
                    sessionStorage.setItem('adminToken', exchangeResult.idToken);
                    sessionStorage.setItem('adminUser', JSON.stringify(data.user));
                    console.log('Token saved to sessionStorage');
                }

                TAAGC.currentUser = data.user;
                TAAGC.userRole = data.user.role;
                TAAGC.userData = data.user;

                // Verify storage worked
                const storedToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
                console.log('Token stored successfully:', !!storedToken);

                return { success: true, user: data.user };
                
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Logout
        async logout() {
            try {
                await firebase.auth().signOut();
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                sessionStorage.clear();
                
                if (TAAGC.auth.sessionTimer) {
                    clearTimeout(TAAGC.auth.sessionTimer);
                }
                
                window.location.href = '/';
                
            } catch (error) {
                console.error('Logout error:', error);
                window.location.href = '/';
            }
        },
        
        // Verify token with Firebase - FIXED VERSION
        async verifyToken() {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            if (!token) {
                console.log('Verify: No token found');
                return false;
            }
            
            try {
                console.log('Verify: Checking Firebase current user');
                const currentUser = firebase.auth().currentUser;
                
                if (!currentUser) {
                    console.log('Verify: No current user in Firebase');
                    return false;
                }
                
                // Try to get a fresh token - if it works, token is valid
                const freshToken = await currentUser.getIdToken(true);
                console.log('Verify: Got fresh token, valid session');
                
                // Update stored token if it changed
                if (freshToken !== token) {
                    console.log('Verify: Updating stored token');
                    if (localStorage.getItem('adminToken')) {
                        localStorage.setItem('adminToken', freshToken);
                    } else {
                        sessionStorage.setItem('adminToken', freshToken);
                    }
                }
                
                return true;
                
            } catch (error) {
                console.error('Verify: Token verification failed:', error);
                return false;
            }
        },
        
        // Require authentication - FIXED VERSION
        async requireAuth(redirectToLogin = true) {
            console.log('requireAuth: Starting auth check');
            
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            
            if (!token) {
                console.log('requireAuth: No token found');
                if (redirectToLogin) {
                    window.location.href = '/';
                }
                return false;
            }
            
            console.log('requireAuth: Token found, verifying...');
            const isValid = await this.verifyToken();
            
            if (!isValid) {
                console.log('requireAuth: Token invalid');
                if (redirectToLogin) {
                    window.location.href = '/';
                }
                return false;
            }
            
            console.log('requireAuth: Token valid');
            this.updateUI();
            return true;
        },
        
        // Start session timer
        startSessionTimer() {
            if (TAAGC.auth.sessionTimer) {
                clearTimeout(TAAGC.auth.sessionTimer);
            }
            
            TAAGC.auth.sessionTimer = setTimeout(() => {
                TAAGC.ui.showToast('Session expired. Please login again.', 'warning');
                TAAGC.auth.logout();
            }, TAAGC.config.sessionTimeout);
        },
        
        // Reset session timer
        resetSessionTimer() {
            if (TAAGC.auth.sessionTimer) {
                clearTimeout(TAAGC.auth.sessionTimer);
                TAAGC.auth.startSessionTimer();
            }
        },
        
        // Update UI with user data
        updateUI() {
            const user = this.getCurrentUser();
            if (!user) return;
            
            // Update user info elements
            document.querySelectorAll('[data-user-field]').forEach(el => {
                const field = el.getAttribute('data-user-field');
                if (field === 'name') el.textContent = user.fullName || 'Admin';
                if (field === 'email') el.textContent = user.email;
                if (field === 'role') {
                    el.textContent = user.role === 'super_admin' ? 'Super Admin' : 'Administrator';
                    el.className = `badge ${user.role === 'super_admin' ? 'badge-danger' : 'badge-warning'}`;
                }
            });
            
            // Show/hide super admin elements
            if (user.role === 'super_admin') {
                document.body.classList.add('super-admin');
                document.querySelectorAll('.super-admin-only').forEach(el => {
                    el.style.display = 'flex';
                });
            }
            
            // Set avatar
            document.querySelectorAll('[data-user-avatar]').forEach(el => {
                el.textContent = (user.fullName || 'A').charAt(0).toUpperCase();
            });
            
            // Update welcome message
            const welcomeEl = document.getElementById('welcomeMessage');
            if (welcomeEl) {
                welcomeEl.textContent = `Welcome back, ${user.fullName || 'Admin'}`;
            }
        }
    },
    
    // ============================================
    // API METHODS
    // ============================================
    api: {
        async request(endpoint, options = {}) {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            try {
                const response = await fetch(`${TAAGC.config.apiUrl}${endpoint}`, {
                    ...options,
                    headers
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    if (response.status === 401) {
                        TAAGC.auth.logout();
                    }
                    throw new Error(data.error || data.message || 'API request failed');
                }
                
                return data;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },
        
        get(endpoint, params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `${endpoint}?${queryString}` : endpoint;
            return this.request(url, { method: 'GET' });
        },
        
        post(endpoint, data = {}) {
            return this.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        
        put(endpoint, data = {}) {
            return this.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },
        
        patch(endpoint, data = {}) {
            return this.request(endpoint, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
        },
        
        delete(endpoint) {
            return this.request(endpoint, { method: 'DELETE' });
        }
    },
    
    // ============================================
    // UI HELPERS
    // ============================================
    ui: {
        showToast(message, type = 'info', duration = 3000) {
            const container = document.getElementById('toastContainer') || this.createToastContainer();
            
            const toast = document.createElement('div');
            toast.className = `alert alert-${type}`;
            
            const icons = {
                success: 'check-circle',
                error: 'exclamation-circle',
                warning: 'exclamation-triangle',
                info: 'info-circle'
            };
            
            toast.innerHTML = `
                <i class="fas fa-${icons[type]}"></i>
                <span>${message}</span>
                <i class="fas fa-times" style="margin-left: auto; cursor: pointer;" onclick="this.parentElement.remove()"></i>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, duration);
        },
        
        createToastContainer() {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
            return container;
        },
        
        showModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },
        
        hideModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        },
        
        confirm(message, callback) {
            if (confirm(message)) {
                callback();
            }
        },
        
        showLoading(containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading...</p>
                    </div>
                `;
            }
        }
    },
    
    // ============================================
    // DATA HELPERS
    // ============================================
    data: {
        formatCurrency(amount, currency = 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        },
        
        formatDate(date) {
            if (!date) return '-';
            const d = new Date(date);
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        
        formatDateTime(date) {
            if (!date) return '-';
            const d = new Date(date);
            return d.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        timeAgo(date) {
            if (!date) return '-';
            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
            
            const intervals = {
                year: 31536000,
                month: 2592000,
                week: 604800,
                day: 86400,
                hour: 3600,
                minute: 60
            };
            
            for (const [unit, secondsInUnit] of Object.entries(intervals)) {
                const interval = Math.floor(seconds / secondsInUnit);
                if (interval >= 1) {
                    return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
                }
            }
            return 'just now';
        },
        
        downloadCSV(data, filename = 'export.csv') {
            if (!data || !data.length) return;
            
            const headers = Object.keys(data[0]);
            const csv = [
                headers.join(','),
                ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        },
        
        generateId(prefix = '') {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 10);
            return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
        }
    }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TAAGC Admin initializing...');
    
    // Add activity listeners for session reset
    ['click', 'mousemove', 'keypress'].forEach(event => {
        document.addEventListener(event, () => TAAGC.auth.resetSessionTimer());
    });
    
    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            TAAGC.auth.logout();
        });
    }
    
    // Add toggle sidebar
    const toggleBtn = document.getElementById('toggleSidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.toggle('collapsed');
            document.querySelector('.main-content')?.classList.toggle('expanded');
        });
    }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TAAGC;
}

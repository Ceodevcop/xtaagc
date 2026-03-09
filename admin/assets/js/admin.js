/* ============================================
   TAAGC ADMIN - MASTER JS FILE
   ONE JS TO RULE ALL 100+ PAGES
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
    console.log('🔥 Firebase initialized');
}

// ============================================
// GLOBAL CONFIGURATION
// ============================================
const TAAGC = {
    version: '3.0.0',
    
    config: {
        apiUrl: '/api',                    // REST API endpoint
        wsUrl: 'wss://api.taagc.website/ws', // WebSocket for real-time
        appName: 'TAAGC Global',
        dateFormat: 'MM/DD/YYYY',
        itemsPerPage: 20,
        sessionTimeout: 30 * 60 * 1000,    // 30 minutes
    },
    
    // Current user state
    currentUser: null,
    userRole: null,
    userData: null,
    sessionTimer: null,
    
    // ============================================
    // AUTHENTICATION
    // ============================================
    auth: {
        // Exchange custom token for ID token
        async exchangeToken(customToken) {
            try {
                console.log('Exchanging custom token...');
                // Sign in with custom token
                const userCredential = await firebase.auth().signInWithCustomToken(customToken);
                // Get fresh ID token
                const idToken = await userCredential.user.getIdToken(true);
                console.log('✅ Token exchanged successfully');
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

        // Check if authenticated (sync check)
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
        
        // Login
        async login(email, password, rememberMe = true) {
            try {
                console.log('Attempting login for:', email);
                
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                // Exchange custom token for ID token
                const exchangeResult = await this.exchangeToken(data.token);
                
                if (!exchangeResult.success) {
                    throw new Error('Failed to authenticate session');
                }

                // Store the ID token (not the custom token)
                if (rememberMe) {
                    localStorage.setItem('adminToken', exchangeResult.idToken);
                    localStorage.setItem('adminUser', JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem('adminToken', exchangeResult.idToken);
                    sessionStorage.setItem('adminUser', JSON.stringify(data.user));
                }

                TAAGC.currentUser = data.user;
                TAAGC.userRole = data.user.role;
                TAAGC.userData = data.user;

                // Set up auth state listener
                firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        console.log('Firebase auth state: logged in as', user.email);
                    } else {
                        console.log('Firebase auth state: logged out');
                    }
                });

                TAAGC.ui.showToast(`Welcome back, ${data.user.fullName || 'Admin'}!`, 'success');
                
                // Start session timer
                TAAGC.auth.startSessionTimer();
                
                return { success: true, user: data.user };
                
            } catch (error) {
                console.error('Login error:', error);
                TAAGC.ui.showToast(error.message, 'error');
                return { success: false, error: error.message };
            }
        },
        
        // Logout
        async logout() {
            try {
                // Sign out from Firebase
                await firebase.auth().signOut();
                
                // Clear storage
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                sessionStorage.clear();
                
                if (TAAGC.auth.sessionTimer) {
                    clearTimeout(TAAGC.auth.sessionTimer);
                }
                
                TAAGC.ui.showToast('Logged out successfully', 'success');
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 500);
                
            } catch (error) {
                console.error('Logout error:', error);
                // Force redirect even if Firebase signout fails
                window.location.href = '/';
            }
        },
        
        // Verify token with Firebase
        async verifyToken() {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            if (!token) return false;
            
            try {
                // Get current Firebase user
                const currentUser = firebase.auth().currentUser;
                
                if (!currentUser) {
                    // Try to restore session from token
                    try {
                        // Attempt to sign in with token (this is a workaround)
                        // In production, you'd use onAuthStateChanged
                        return false;
                    } catch (e) {
                        return false;
                    }
                }
                
                // Verify the token is still valid by getting a fresh one
                const freshToken = await currentUser.getIdToken(true);
                
                // Update stored token if it changed
                if (freshToken !== token) {
                    if (localStorage.getItem('adminToken')) {
                        localStorage.setItem('adminToken', freshToken);
                    } else {
                        sessionStorage.setItem('adminToken', freshToken);
                    }
                }
                
                return true;
                
            } catch (error) {
                console.error('Token verification error:', error);
                return false;
            }
        },
        
        // Require authentication (async version for dashboard)
        async requireAuth(redirectToLogin = true) {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            
            if (!token) {
                if (redirectToLogin) {
                    window.location.href = '/';
                }
                return false;
            }
            
            // Verify token is valid
            const isValid = await this.verifyToken();
            if (!isValid) {
                if (redirectToLogin) {
                    window.location.href = '/';
                }
                return false;
            }
            
            this.updateUI();
            return true;
        },
        
        // Legacy requireAuth for backward compatibility
        requireAuthSync() {
            if (!this.isAuthenticated()) {
                window.location.href = '/';
                return false;
            }
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
            
            console.log('Updating UI for user:', user);
            
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
    // API METHODS - RESTful for Banks & Agencies
    // ============================================
    api: {
        // Base request method
        async request(endpoint, options = {}) {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
            
            const headers = {
                'Content-Type': 'application/json',
                'X-API-Version': '3.0.0',
                ...options.headers
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            // Add CSRF token if available
            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken.getAttribute('content');
            }
            
            try {
                const response = await fetch(`${TAAGC.config.apiUrl}${endpoint}`, {
                    ...options,
                    headers
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    if (response.status === 401) {
                        // Unauthorized - token expired or invalid
                        TAAGC.ui.showToast('Session expired. Please login again.', 'warning');
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
        
        // RESTful methods
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
        },
        
        // ============================================
        // BANK API METHODS
        // ============================================
        banks: {
            getAll(params = {}) {
                return TAAGC.api.get('/banks', params);
            },
            getById(id) {
                return TAAGC.api.get(`/banks/${id}`);
            },
            create(data) {
                return TAAGC.api.post('/banks', data);
            },
            update(id, data) {
                return TAAGC.api.put(`/banks/${id}`, data);
            },
            delete(id) {
                return TAAGC.api.delete(`/banks/${id}`);
            },
            getAccounts(bankId) {
                return TAAGC.api.get(`/banks/${bankId}/accounts`);
            },
            getTransactions(bankId, params = {}) {
                return TAAGC.api.get(`/banks/${bankId}/transactions`, params);
            },
            sync(bankId) {
                return TAAGC.api.post(`/banks/${bankId}/sync`);
            },
            testConnection(bankId) {
                return TAAGC.api.post(`/banks/${bankId}/test`);
            },
            getStatements(bankId, params = {}) {
                return TAAGC.api.get(`/banks/${bankId}/statements`, params);
            },
            reconcile(accountId, data) {
                return TAAGC.api.post(`/banks/accounts/${accountId}/reconcile`, data);
            }
        },
        
        // ============================================
        // AGENCY API METHODS
        // ============================================
        agencies: {
            getAll(params = {}) {
                return TAAGC.api.get('/agencies', params);
            },
            getById(id) {
                return TAAGC.api.get(`/agencies/${id}`);
            },
            create(data) {
                return TAAGC.api.post('/agencies', data);
            },
            update(id, data) {
                return TAAGC.api.put(`/agencies/${id}`, data);
            },
            delete(id) {
                return TAAGC.api.delete(`/agencies/${id}`);
            },
            getContracts(agencyId) {
                return TAAGC.api.get(`/agencies/${agencyId}/contracts`);
            },
            getCommissions(agencyId, params = {}) {
                return TAAGC.api.get(`/agencies/${agencyId}/commissions`, params);
            },
            getPayments(agencyId, params = {}) {
                return TAAGC.api.get(`/agencies/${agencyId}/payments`, params);
            },
            generateApiKey(agencyId) {
                return TAAGC.api.post(`/agencies/${agencyId}/api-key`);
            },
            revokeApiKey(agencyId, keyId) {
                return TAAGC.api.delete(`/agencies/${agencyId}/api-keys/${keyId}`);
            },
            getPerformance(agencyId, params = {}) {
                return TAAGC.api.get(`/agencies/${agencyId}/performance`, params);
            }
        },
        
        // ============================================
        // TRANSACTION API METHODS
        // ============================================
        transactions: {
            getAll(params = {}) {
                return TAAGC.api.get('/transactions', params);
            },
            getById(id) {
                return TAAGC.api.get(`/transactions/${id}`);
            },
            create(data) {
                return TAAGC.api.post('/transactions', data);
            },
            updateStatus(id, status) {
                return TAAGC.api.patch(`/transactions/${id}/status`, { status });
            },
            getPending() {
                return TAAGC.api.get('/transactions/pending');
            },
            processWithdrawal(data) {
                return TAAGC.api.post('/transactions/withdrawals', data);
            },
            processDeposit(data) {
                return TAAGC.api.post('/transactions/deposits', data);
            }
        }
    },
    
    // ============================================
    // UI HELPERS
    // ============================================
    ui: {
        // Show toast notification
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
        
        // Show modal
        showModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },
        
        // Hide modal
        hideModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        },
        
        // Show confirmation dialog
        confirm(message, callback) {
            if (confirm(message)) {
                callback();
            }
        },
        
        // Show loading
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
        // Format currency
        formatCurrency(amount, currency = 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        },
        
        // Format date
        formatDate(date) {
            if (!date) return '-';
            const d = new Date(date);
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        
        // Format datetime
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
        
        // Time ago
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
        
        // Download CSV
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
        
        // Generate random ID
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
    
    // Check authentication for protected pages
    const currentPath = window.location.pathname;
    const isProtected = !currentPath.includes('index.html') && 
                        !currentPath.endsWith('/') && 
                        currentPath !== '/' &&
                        !currentPath.includes('login');
    
    if (isProtected) {
        console.log('Protected page detected, checking auth...');
        const isAuthed = await TAAGC.auth.requireAuth(true);
        if (!isAuthed) {
            console.log('Not authenticated, redirecting to login');
            return;
        }
    }
    
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
    
    // Add styles for toasts if not present
    if (!document.getElementById('toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .super-admin-only { display: none; }
            .toast-close { cursor: pointer; opacity: 0.7; }
            .toast-close:hover { opacity: 1; }
        `;
        document.head.appendChild(style);
    }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TAAGC;
}

/* ============================================
   TAAGC ADMIN - MASTER JS FILE
   ONE JS TO RULE ALL 100+ PAGES
   Version: 3.0.0
   ============================================ */

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
        // Check if authenticated
        isAuthenticated() {
            return !!localStorage.getItem('adminToken');
        },
        
        // Get current user
        getCurrentUser() {
            if (TAAGC.currentUser) return TAAGC.currentUser;
            
            const userStr = localStorage.getItem('adminUser');
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
                const response = await TAAGC.api.post('/auth/login', {
                    email,
                    password,
                    rememberMe
                });
                
                if (response.success && response.token) {
                    if (rememberMe) {
                        localStorage.setItem('adminToken', response.token);
                        localStorage.setItem('adminUser', JSON.stringify(response.user));
                    } else {
                        sessionStorage.setItem('adminToken', response.token);
                        sessionStorage.setItem('adminUser', JSON.stringify(response.user));
                    }
                    
                    TAAGC.currentUser = response.user;
                    TAAGC.userRole = response.user.role;
                    TAAGC.userData = response.user;
                    
                    TAAGC.ui.showToast(`Welcome back, ${response.user.fullName}!`, 'success');
                    
                    // Start session timer
                    TAAGC.auth.startSessionTimer();
                    
                    return { success: true, user: response.user };
                }
            } catch (error) {
                TAAGC.ui.showToast(error.message, 'error');
                return { success: false };
            }
        },
        
        // Logout
        async logout() {
            try {
                await TAAGC.api.post('/auth/logout');
            } catch (e) {
                // Ignore errors
            } finally {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                sessionStorage.clear();
                
                if (TAAGC.auth.sessionTimer) {
                    clearTimeout(TAAGC.auth.sessionTimer);
                }
                
                window.location.href = '/';
            }
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
        },
        
        // Require authentication
        requireAuth() {
            if (!this.isAuthenticated()) {
                window.location.href = '/';
                return false;
            }
            
            this.updateUI();
            return true;
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
            // Get all banks
            getAll(params = {}) {
                return TAAGC.api.get('/banks', params);
            },
            
            // Get bank by ID
            getById(id) {
                return TAAGC.api.get(`/banks/${id}`);
            },
            
            // Create new bank
            create(data) {
                return TAAGC.api.post('/banks', data);
            },
            
            // Update bank
            update(id, data) {
                return TAAGC.api.put(`/banks/${id}`, data);
            },
            
            // Delete bank
            delete(id) {
                return TAAGC.api.delete(`/banks/${id}`);
            },
            
            // Get bank accounts
            getAccounts(bankId) {
                return TAAGC.api.get(`/banks/${bankId}/accounts`);
            },
            
            // Get bank transactions
            getTransactions(bankId, params = {}) {
                return TAAGC.api.get(`/banks/${bankId}/transactions`, params);
            },
            
            // Sync bank data
            sync(bankId) {
                return TAAGC.api.post(`/banks/${bankId}/sync`);
            },
            
            // Test bank connection
            testConnection(bankId) {
                return TAAGC.api.post(`/banks/${bankId}/test`);
            },
            
            // Get bank statements
            getStatements(bankId, params = {}) {
                return TAAGC.api.get(`/banks/${bankId}/statements`, params);
            },
            
            // Reconcile bank account
            reconcile(accountId, data) {
                return TAAGC.api.post(`/banks/accounts/${accountId}/reconcile`, data);
            }
        },
        
        // ============================================
        // AGENCY API METHODS
        // ============================================
        agencies: {
            // Get all agencies
            getAll(params = {}) {
                return TAAGC.api.get('/agencies', params);
            },
            
            // Get agency by ID
            getById(id) {
                return TAAGC.api.get(`/agencies/${id}`);
            },
            
            // Create new agency
            create(data) {
                return TAAGC.api.post('/agencies', data);
            },
            
            // Update agency
            update(id, data) {
                return TAAGC.api.put(`/agencies/${id}`, data);
            },
            
            // Delete agency
            delete(id) {
                return TAAGC.api.delete(`/agencies/${id}`);
            },
            
            // Get agency contracts
            getContracts(agencyId) {
                return TAAGC.api.get(`/agencies/${agencyId}/contracts`);
            },
            
            // Get agency commissions
            getCommissions(agencyId, params = {}) {
                return TAAGC.api.get(`/agencies/${agencyId}/commissions`, params);
            },
            
            // Get agency payments
            getPayments(agencyId, params = {}) {
                return TAAGC.api.get(`/agencies/${agencyId}/payments`, params);
            },
            
            // Generate API key for agency
            generateApiKey(agencyId) {
                return TAAGC.api.post(`/agencies/${agencyId}/api-key`);
            },
            
            // Revoke API key
            revokeApiKey(agencyId, keyId) {
                return TAAGC.api.delete(`/agencies/${agencyId}/api-keys/${keyId}`);
            },
            
            // Get agency performance
            getPerformance(agencyId, params = {}) {
                return TAAGC.api.get(`/agencies/${agencyId}/performance`, params);
            }
        },
        
        // ============================================
        // TRANSACTION API METHODS
        // ============================================
        transactions: {
            // Get all transactions
            getAll(params = {}) {
                return TAAGC.api.get('/transactions', params);
            },
            
            // Get transaction by ID
            getById(id) {
                return TAAGC.api.get(`/transactions/${id}`);
            },
            
            // Create transaction
            create(data) {
                return TAAGC.api.post('/transactions', data);
            },
            
            // Update transaction status
            updateStatus(id, status) {
                return TAAGC.api.patch(`/transactions/${id}/status`, { status });
            },
            
            // Get pending transactions
            getPending() {
                return TAAGC.api.get('/transactions/pending');
            },
            
            // Process withdrawal
            processWithdrawal(data) {
                return TAAGC.api.post('/transactions/withdrawals', data);
            },
            
            // Process deposit
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
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication for protected pages
    if (!window.location.pathname.includes('index.html') && 
        !window.location.pathname.endsWith('/') && 
        window.location.pathname !== '/') {
        TAAGC.auth.requireAuth();
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
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TAAGC;
}

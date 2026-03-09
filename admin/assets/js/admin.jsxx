/* ============================================
   TAAGC ADMIN - SINGLE JS FILE WITH API
   Version: 2.0.0
   ============================================ */

const TAAGC = {
    version: '2.0.0',
    
    config: {
        apiUrl: '/api',  // Points to your API
        appName: 'TAAGC Global'
    },
    
    // Current user state
    currentUser: null,
    userRole: null,
    userData: null,
    
    // ============================================
    // API METHODS
    // ============================================
    api: {
        // Make API request with auth token
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
                    throw new Error(data.error || 'API request failed');
                }
                
                return data;
            } catch (error) {
                console.error('API Error:', error);
                TAAGC.ui.showToast(error.message, 'error');
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
    // AUTH METHODS
    // ============================================
    auth: {
        // Login
        async login(email, password) {
            try {
                // Call your API login endpoint
                const response = await TAAGC.api.post('/auth/login', { email, password });
                
                if (response.success && response.token) {
                    localStorage.setItem('adminToken', response.token);
                    localStorage.setItem('adminUser', JSON.stringify(response.user));
                    
                    TAAGC.currentUser = response.user;
                    TAAGC.userRole = response.user.role;
                    TAAGC.userData = response.user;
                    
                    TAAGC.ui.showToast('Login successful!', 'success');
                    
                    // Redirect based on role
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard.html';
                    }, 1000);
                    
                    return { success: true };
                }
            } catch (error) {
                TAAGC.ui.showToast(error.message, 'error');
                return { success: false };
            }
        },
        
        // Logout
        async logout() {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            sessionStorage.clear();
            
            TAAGC.ui.showToast('Logged out successfully', 'success');
            
            setTimeout(() => {
                window.location.href = '/admin/login.html';
            }, 1000);
        },
        
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
        
        // Redirect if not authenticated
        requireAuth() {
            if (!this.isAuthenticated()) {
                window.location.href = '/admin/login.html';
                return false;
            }
            
            // Update UI with user data
            this.updateUI();
            return true;
        },
        
        // Update UI with user info
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
                document.querySelectorAll('.super-admin-only').forEach(el => el.style.display = 'block');
            } else {
                document.querySelectorAll('.super-admin-only').forEach(el => el.style.display = 'none');
            }
            
            // Set avatar
            document.querySelectorAll('[data-user-avatar]').forEach(el => {
                el.textContent = (user.fullName || 'A').charAt(0).toUpperCase();
            });
        }
    },
    
    // ============================================
    // UI HELPERS
    // ============================================
    ui: {
        showToast(message, type = 'info', duration = 3000) {
            const container = document.getElementById('toastContainer') || this.createToastContainer();
            
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            const icons = {
                success: 'check-circle',
                error: 'exclamation-circle',
                warning: 'exclamation-triangle',
                info: 'info-circle'
            };
            
            toast.innerHTML = `
                <i class="fas fa-${icons[type]}"></i>
                <span>${message}</span>
                <i class="fas fa-times toast-close"></i>
            `;
            
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderLeft: `4px solid ${
                    type === 'success' ? '#10b981' : 
                    type === 'error' ? '#e53e3e' : 
                    type === 'warning' ? '#f59e0b' : '#c19a6b'
                }`,
                zIndex: '9999',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'slideIn 0.3s ease'
            });
            
            container.appendChild(toast);
            
            toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
            
            setTimeout(() => toast.remove(), duration);
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
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication for protected pages
    if (!window.location.pathname.includes('login.html')) {
        TAAGC.auth.requireAuth();
    }
    
    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            TAAGC.auth.logout();
        });
    }
    
    // Add toast styles
    const style = document.createElement('style');
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
});

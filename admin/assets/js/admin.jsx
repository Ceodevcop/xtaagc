/* ============================================
   TAAGC ADMIN - SINGLE JS FILE
   ONE JS TO RULE THEM ALL
   Version: 1.0.0
   ============================================ */

// ============================================
// 1. GLOBAL CONFIGURATION
// ============================================
const TAAGC_ADMIN = {
    version: '1.0.0',
    name: 'TAAGC Admin',
    
    config: {
        apiUrl: '/api',
        appName: 'TAAGC Global',
        dateFormat: 'MM/DD/YYYY',
        itemsPerPage: 20,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
    },
    
    // Firebase Config
    firebaseConfig: {
        apiKey: "AIzaSyCOcCDPqRSlAMJJBEeNchTA1qO9tl9Nldw",
        authDomain: "xtaagc.firebaseapp.com",
        projectId: "xtaagc",
        storageBucket: "xtaagc.appspot.com",
        messagingSenderId: "256073982437",
        appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c"
    },
    
    // Current user state
    currentUser: null,
    userRole: null,
    userData: null,
    sessionTimer: null
};

// ============================================
// 2. FIREBASE INITIALIZATION
// ============================================
(function initFirebase() {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(TAAGC_ADMIN.firebaseConfig);
        console.log('🔥 Firebase initialized');
    }
})();

// ============================================
// 3. AUTHENTICATION
// ============================================
const TAAGC_AUTH = {
    // Initialize auth state
    init: function() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                await this.loadUserData(user);
                this.updateUIForAuth();
                this.startSessionTimer();
            } else {
                this.redirectToLogin();
            }
        });
    },
    
    // Load user data from Firestore
    loadUserData: async function(user) {
        try {
            const db = firebase.firestore();
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (userDoc.exists) {
                TAAGC_ADMIN.currentUser = user;
                TAAGC_ADMIN.userData = userDoc.data();
                TAAGC_ADMIN.userRole = userDoc.data().role;
                
                // Store in session
                sessionStorage.setItem('adminId', user.uid);
                sessionStorage.setItem('adminRole', TAAGC_ADMIN.userRole);
                sessionStorage.setItem('adminData', JSON.stringify(TAAGC_ADMIN.userData));
                
                // Check if super admin
                if (TAAGC_ADMIN.userRole === 'super_admin') {
                    document.body.classList.add('super-admin');
                }
                
                return TAAGC_ADMIN.userData;
            } else {
                console.error('User data not found');
                this.logout();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showToast('Error loading user data', 'error');
        }
    },
    
    // Login
    login: async function(email, password) {
        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = result.user;
            
            // Check if admin
            const db = firebase.firestore();
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists || !['admin', 'super_admin'].includes(userDoc.data().role)) {
                await this.logout();
                throw new Error('Not an administrator');
            }
            
            this.showToast('Login successful!', 'success');
            window.location.href = '/admin/dashboard.html';
            return { success: true };
            
        } catch (error) {
            console.error('Login error:', error);
            this.showToast(this.getErrorMessage(error), 'error');
            return { success: false };
        }
    },
    
    // Logout
    logout: async function() {
        try {
            await firebase.auth().signOut();
            sessionStorage.clear();
            localStorage.removeItem('adminToken');
            if (TAAGC_ADMIN.sessionTimer) {
                clearTimeout(TAAGC_ADMIN.sessionTimer);
            }
            window.location.href = '/admin/login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    },
    
    // Check if super admin
    isSuperAdmin: function() {
        return TAAGC_ADMIN.userRole === 'super_admin';
    },
    
    // Redirect to login
    redirectToLogin: function() {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html')) {
            window.location.href = '/admin/login.html';
        }
    },
    
    // Update UI based on auth
    updateUIForAuth: function() {
        // Update user info in sidebar
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userAvatarEl = document.getElementById('userAvatar');
        const userRoleEl = document.getElementById('userRole');
        
        if (userNameEl) userNameEl.textContent = TAAGC_ADMIN.userData?.fullName || 'Admin';
        if (userEmailEl) userEmailEl.textContent = TAAGC_ADMIN.currentUser?.email || '';
        if (userAvatarEl) userAvatarEl.textContent = (TAAGC_ADMIN.userData?.fullName || 'A').charAt(0);
        if (userRoleEl) {
            userRoleEl.textContent = TAAGC_ADMIN.userRole === 'super_admin' ? 'Super Admin' : 'Administrator';
            userRoleEl.className = `admin-role ${TAAGC_ADMIN.userRole}`;
        }
        
        // Hide/show super admin elements
        if (TAAGC_ADMIN.userRole === 'super_admin') {
            document.querySelectorAll('.super-admin-only').forEach(el => el.style.display = 'block');
        }
    },
    
    // Start session timer
    startSessionTimer: function() {
        if (TAAGC_ADMIN.sessionTimer) clearTimeout(TAAGC_ADMIN.sessionTimer);
        
        TAAGC_ADMIN.sessionTimer = setTimeout(() => {
            this.showToast('Session expired. Please login again.', 'warning');
            this.logout();
        }, TAAGC_ADMIN.config.sessionTimeout);
    },
    
    // Reset session timer on activity
    resetSessionTimer: function() {
        if (TAAGC_ADMIN.sessionTimer) {
            clearTimeout(TAAGC_ADMIN.sessionTimer);
            this.startSessionTimer();
        }
    },
    
    // Get error message
    getErrorMessage: function(error) {
        const messages = {
            'auth/user-not-found': 'User not found',
            'auth/wrong-password': 'Invalid password',
            'auth/email-already-in-use': 'Email already registered',
            'auth/weak-password': 'Password too weak',
            'auth/invalid-email': 'Invalid email',
            'auth/too-many-requests': 'Too many attempts. Try later'
        };
        return messages[error.code] || error.message;
    }
};

// ============================================
// 4. UI HELPERS
// ============================================
const TAAGC_UI = {
    // Show toast notification
    showToast: function(message, type = 'info', duration = 3000) {
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
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            <span>${message}</span>
            <i class="fas fa-times toast-close" onclick="this.parentElement.remove()"></i>
        `;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            background: 'white',
            padding: '15px 25px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${
                type === 'success' ? '#10b981' : 
                type === 'error' ? '#e53e3e' : 
                type === 'warning' ? '#f59e0b' : '#c19a6b'
            }`,
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideIn 0.3s ease'
        });
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    // Create toast container
    createToastContainer: function() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.position = 'fixed';
        container.style.bottom = '30px';
        container.style.right = '30px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    },
    
    // Show modal
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Hide modal
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    },
    
    // Show loading
    showLoading: function(containerId, message = 'Loading...') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    },
    
    // Show confirmation dialog
    confirm: function(message, callback) {
        if (confirm(message)) {
            callback();
        }
    }
};

// ============================================
// 5. DATA HELPERS
// ============================================
const TAAGC_DATA = {
    // Format currency
    formatCurrency: function(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    },
    
    // Format date
    formatDate: function(date, format = 'MM/DD/YYYY') {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        
        return format
            .replace('MM', month)
            .replace('DD', day)
            .replace('YYYY', year);
    },
    
    // Time ago
    timeAgo: function(date) {
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
    
    // Generate ID
    generateId: function(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 10);
        return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
    },
    
    // Copy to clipboard
    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            TAAGC_UI.showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            TAAGC_UI.showToast('Failed to copy', 'error');
        });
    },
    
    // Download as CSV
    downloadCSV: function(data, filename = 'export.csv') {
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
};

// ============================================
// 6. API METHODS
// ============================================
const TAAGC_API = {
    // Make API request
    request: async function(endpoint, options = {}) {
        const url = `${TAAGC_ADMIN.config.apiUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Add auth token if available
        const token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(url, {
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
            TAAGC_UI.showToast(error.message, 'error');
            throw error;
        }
    },
    
    // GET request
    get: function(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },
    
    // POST request
    post: function(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT request
    put: function(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE request
    delete: function(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// ============================================
// 7. TABLE MANAGEMENT
// ============================================
class TAAGC_Table {
    constructor(tableId, options = {}) {
        this.table = document.getElementById(tableId);
        if (!this.table) return;
        
        this.tbody = this.table.querySelector('tbody') || this.table.appendChild(document.createElement('tbody'));
        this.options = {
            pageSize: options.pageSize || 20,
            onRowClick: options.onRowClick || null,
            ...options
        };
        
        this.data = [];
        this.currentPage = 1;
        this.filteredData = [];
    }
    
    // Render table
    render(data, columns) {
        this.data = data || [];
        this.filteredData = [...this.data];
        
        const start = (this.currentPage - 1) * this.options.pageSize;
        const pageData = this.filteredData.slice(start, start + this.options.pageSize);
        
        if (!pageData.length) {
            this.tbody.innerHTML = `<tr><td colspan="${columns.length}" class="text-center p-3">No data found</td></tr>`;
            return;
        }
        
        this.tbody.innerHTML = pageData.map(row => {
            return '<tr>' + columns.map(col => {
                let value = row[col.field] || '-';
                
                // Apply formatter if provided
                if (col.formatter) {
                    value = col.formatter(value, row);
                }
                
                // Apply badge if type specified
                if (col.type === 'badge') {
                    const badgeClass = {
                        active: 'badge-success',
                        pending: 'badge-warning',
                        inactive: 'badge-danger',
                        approved: 'badge-success',
                        rejected: 'badge-danger'
                    }[value.toLowerCase()] || 'badge-info';
                    
                    value = `<span class="badge ${badgeClass}">${value}</span>`;
                }
                
                // Apply currency format
                if (col.type === 'currency') {
                    value = TAAGC_DATA.formatCurrency(value);
                }
                
                // Apply date format
                if (col.type === 'date') {
                    value = TAAGC_DATA.formatDate(value);
                }
                
                // Apply timeago
                if (col.type === 'timeago') {
                    value = TAAGC_DATA.timeAgo(value);
                }
                
                return `<td>${value}</td>`;
            }).join('') + '</tr>';
        }).join('');
        
        // Add click handlers
        if (this.options.onRowClick) {
            this.tbody.querySelectorAll('tr').forEach((tr, index) => {
                tr.addEventListener('click', () => {
                    this.options.onRowClick(pageData[index]);
                });
                tr.style.cursor = 'pointer';
            });
        }
        
        // Render pagination
        this.renderPagination();
    }
    
    // Render pagination
    renderPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
        const paginationEl = document.getElementById(this.options.paginationId || 'pagination');
        
        if (!paginationEl || totalPages <= 1) return;
        
        let html = '<div class="pagination">';
        
        // Previous button
        html += `<button class="page-link" onclick="window.taagcTable.prevPage()" ${this.currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="page-link ${i === this.currentPage ? 'active' : ''}" onclick="window.taagcTable.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += `<span class="page-link">...</span>`;
            }
        }
        
        // Next button
        html += `<button class="page-link" onclick="window.taagcTable.nextPage()" ${this.currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>`;
        
        html += '</div>';
        
        paginationEl.innerHTML = html;
    }
    
    // Go to page
    goToPage(page) {
        if (page >= 1 && page <= Math.ceil(this.filteredData.length / this.options.pageSize)) {
            this.currentPage = page;
            this.render(this.data, this.options.columns);
        }
    }
    
    // Next page
    nextPage() {
        this.goToPage(this.currentPage + 1);
    }
    
    // Previous page
    prevPage() {
        this.goToPage(this.currentPage - 1);
    }
    
    // Filter data
    filter(searchTerm, fields = []) {
        if (!searchTerm) {
            this.filteredData = [...this.data];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredData = this.data.filter(row => {
                return fields.some(field => {
                    const value = String(row[field] || '').toLowerCase();
                    return value.includes(term);
                });
            });
        }
        
        this.currentPage = 1;
        this.render(this.data, this.options.columns);
    }
    
    // Sort data
    sort(field, direction = 'asc') {
        this.filteredData.sort((a, b) => {
            let valA = a[field] || '';
            let valB = b[field] || '';
            
            if (typeof valA === 'number') {
                return direction === 'asc' ? valA - valB : valB - valA;
            }
            
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
            
            if (direction === 'asc') {
                return valA.localeCompare(valB);
            } else {
                return valB.localeCompare(valA);
            }
        });
        
        this.currentPage = 1;
        this.render(this.data, this.options.columns);
    }
}

// ============================================
// 8. FORM HANDLING
// ============================================
const TAAGC_FORM = {
    // Validate form
    validate: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return true;
        
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
                
                // Add error message
                let errorDiv = input.parentElement.querySelector('.error-message');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.style.color = '#e53e3e';
                    errorDiv.style.fontSize = '12px';
                    errorDiv.style.marginTop = '4px';
                    input.parentElement.appendChild(errorDiv);
                }
                errorDiv.textContent = `${input.previousElementSibling?.textContent || 'This field'} is required`;
            } else {
                input.classList.remove('error');
                const errorDiv = input.parentElement.querySelector('.error-message');
                if (errorDiv) errorDiv.remove();
            }
        });
        
        return isValid;
    },
    
    // Get form data
    getFormData: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },
    
    // Reset form
    resetForm: function(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    },
    
    // Populate form
    populateForm: function(formId, data) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"], #${key}`);
            if (input) input.value = data[key];
        });
    }
};

// ============================================
// 9. SIDEBAR MANAGEMENT
// ============================================
const TAAGC_SIDEBAR = {
    // Toggle sidebar
    toggle: function() {
        const sidebar = document.querySelector('.admin-sidebar');
        const main = document.querySelector('.admin-main');
        
        if (sidebar && main) {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded');
            
            // Save preference
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    },
    
    // Set active nav item
    setActive: function(path) {
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            const href = item.getAttribute('onclick') || '';
            if (href.includes(path)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    // Load preference
    loadPreference: function() {
        const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (collapsed) {
            document.querySelector('.admin-sidebar')?.classList.add('collapsed');
            document.querySelector('.admin-main')?.classList.add('expanded');
        }
    }
};

// ============================================
// 10. INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth
    TAAGC_AUTH.init();
    
    // Load sidebar preference
    TAAGC_SIDEBAR.loadPreference();
    
    // Add activity listeners for session reset
    ['click', 'mousemove', 'keypress'].forEach(event => {
        document.addEventListener(event, () => TAAGC_AUTH.resetSessionTimer());
    });
    
    // Add toggle sidebar button if exists
    const toggleBtn = document.getElementById('toggleSidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', TAAGC_SIDEBAR.toggle);
    }
    
    // Add logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            TAAGC_AUTH.logout();
        });
    }
    
    // Add styles for toasts
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .toast-close {
            margin-left: auto;
            cursor: pointer;
            opacity: 0.7;
        }
        .toast-close:hover {
            opacity: 1;
        }
        .super-admin-only {
            display: none;
        }
        .super-admin .super-admin-only {
            display: flex;
        }
    `;
    document.head.appendChild(style);
});

// ============================================
// 11. EXPORTS (for use in pages)
// ============================================
window.TAAGC = {
    Admin: TAAGC_ADMIN,
    Auth: TAAGC_AUTH,
    UI: TAAGC_UI,
    Data: TAAGC_DATA,
    API: TAAGC_API,
    Table: TAAGC_Table,
    Form: TAAGC_FORM,
    Sidebar: TAAGC_SIDEBAR
};

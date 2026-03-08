/**
 * TAAGC PLATFORM - SINGLE JAVASCRIPT FILE
 * All functionality for entire platform
 * Version: 2.0.0
 */

// ============================================
// 1. GLOBAL CONFIGURATION
// ============================================
const CONFIG = {
    API_URL: window.location.origin + '/api',
    APP_NAME: 'TAAGC Global',
    VERSION: '2.0.0',
    CURRENCY: 'USD',
    DATE_FORMAT: 'MM/DD/YYYY',
    ITEMS_PER_PAGE: 20
};

// ============================================
// 2. FIREBASE INITIALIZATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyAI1MrcP977UgRLQoePxl64JOSyj9v4WpI",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.appspot.com",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c",
    measurementId: "G-1SDELC2KQ8"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true })
    .catch(err => console.log('Persistence error:', err));

// ============================================
// 3. AUTHENTICATION STATE
// ============================================
let currentUser = null;
let userProfile = null;

auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    
    if (user) {
        await loadUserProfile(user.uid);
        updateUIForAuth();
        
        // Track page view
        trackPageView(window.location.pathname);
    } else {
        userProfile = null;
        updateUIForGuest();
    }
    
    // Update navbar based on auth state
    updateNavbar();
});

// ============================================
// 4. USER PROFILE MANAGEMENT
// ============================================
async function loadUserProfile(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            userProfile = { id: doc.id, ...doc.data() };
            return userProfile;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile', 'error');
    }
    return null;
}

async function updateUserProfile(updates) {
    if (!currentUser) return false;
    
    try {
        await db.collection('users').doc(currentUser.uid).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await loadUserProfile(currentUser.uid);
        showToast('Profile updated successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast(error.message, 'error');
        return false;
    }
}

// ============================================
// 5. AUTHENTICATION METHODS
// ============================================
const Auth = {
    // Login with email/password
    login: async (email, password, remember = false) => {
        try {
            if (remember) {
                await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            }
            
            const result = await auth.signInWithEmailAndPassword(email, password);
            showToast('Login successful!', 'success');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Login error:', error);
            showToast(getAuthErrorMessage(error), 'error');
            return { success: false, error: error.message };
        }
    },
    
    // Register new user
    register: async (email, password, profile) => {
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // Create user profile
            await db.collection('users').doc(result.user.uid).set({
                uid: result.user.uid,
                email: email,
                fullName: profile.fullName || '',
                phone: profile.phone || '',
                role: 'client',
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Send verification email
            await result.user.sendEmailVerification();
            
            showToast('Registration successful! Please verify your email.', 'success');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Registration error:', error);
            showToast(getAuthErrorMessage(error), 'error');
            return { success: false, error: error.message };
        }
    },
    
    // Logout
    logout: async () => {
        try {
            await auth.signOut();
            showToast('Logged out successfully', 'success');
            window.location.href = '/';
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            showToast(error.message, 'error');
            return { success: false };
        }
    },
    
    // Reset password
    resetPassword: async (email) => {
        try {
            await auth.sendPasswordResetEmail(email);
            showToast('Password reset email sent!', 'success');
            return { success: true };
        } catch (error) {
            console.error('Reset error:', error);
            showToast(getAuthErrorMessage(error), 'error');
            return { success: false };
        }
    },
    
    // Google login
    googleLogin: async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            
            // Check if user exists in Firestore
            const userDoc = await db.collection('users').doc(result.user.uid).get();
            
            if (!userDoc.exists) {
                // Create new user profile
                await db.collection('users').doc(result.user.uid).set({
                    uid: result.user.uid,
                    email: result.user.email,
                    fullName: result.user.displayName,
                    photoURL: result.user.photoURL,
                    role: 'client',
                    status: 'active',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            showToast('Google login successful!', 'success');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google login error:', error);
            showToast(error.message, 'error');
            return { success: false };
        }
    }
};

// ============================================
// 6. DATABASE METHODS
// ============================================
const DB = {
    // Get document by ID
    get: async (collection, id) => {
        try {
            const doc = await db.collection(collection).doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error(`Error getting ${collection}/${id}:`, error);
            return null;
        }
    },
    
    // Query collection
    query: async (collection, conditions = [], options = {}) => {
        try {
            let query = db.collection(collection);
            
            // Apply where conditions
            conditions.forEach(cond => {
                query = query.where(cond.field, cond.operator, cond.value);
            });
            
            // Apply order
            if (options.orderBy) {
                query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
            }
            
            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`Error querying ${collection}:`, error);
            return [];
        }
    },
    
    // Add document
    add: async (collection, data) => {
        try {
            const docRef = await db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error(`Error adding to ${collection}:`, error);
            return { success: false, error: error.message };
        }
    },
    
    // Update document
    update: async (collection, id, updates) => {
        try {
            await db.collection(collection).doc(id).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error(`Error updating ${collection}/${id}:`, error);
            return { success: false, error: error.message };
        }
    },
    
    // Delete document
    delete: async (collection, id) => {
        try {
            await db.collection(collection).doc(id).delete();
            return { success: true };
        } catch (error) {
            console.error(`Error deleting ${collection}/${id}:`, error);
            return { success: false, error: error.message };
        }
    },
    
    // Batch write
    batch: async (operations) => {
        const batch = db.batch();
        
        try {
            operations.forEach(op => {
                const ref = db.collection(op.collection).doc(op.id);
                if (op.type === 'set') {
                    batch.set(ref, op.data, { merge: op.merge || false });
                } else if (op.type === 'update') {
                    batch.update(ref, op.data);
                } else if (op.type === 'delete') {
                    batch.delete(ref);
                }
            });
            
            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error('Batch error:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============================================
// 7. STORAGE METHODS
// ============================================
const Storage = {
    // Upload file
    upload: async (path, file, onProgress = null) => {
        try {
            const ref = storage.ref().child(path);
            const task = ref.put(file);
            
            if (onProgress) {
                task.on('state_changed', onProgress);
            }
            
            const snapshot = await task;
            const url = await snapshot.ref.getDownloadURL();
            
            return { success: true, url };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Delete file
    delete: async (path) => {
        try {
            const ref = storage.ref().child(path);
            await ref.delete();
            return { success: true };
        } catch (error) {
            console.error('Delete error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get download URL
    getUrl: async (path) => {
        try {
            const ref = storage.ref().child(path);
            const url = await ref.getDownloadURL();
            return { success: true, url };
        } catch (error) {
            console.error('Get URL error:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============================================
// 8. UI HELPERS
// ============================================

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <i class="fas fa-times toast-close" onclick="this.parentElement.remove()"></i>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, duration);
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Show loading
function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Hide loading
function hideLoading(containerId) {
    // Implementation depends on your loading pattern
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date
function formatDate(date, format = 'MM/DD/YYYY') {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    
    return format
        .replace('MM', month)
        .replace('DD', day)
        .replace('YYYY', year);
}

// Format relative time
function timeAgo(date) {
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
}

// Get error message
function getAuthErrorMessage(error) {
    const messages = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already registered',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/invalid-email': 'Invalid email address',
        'auth/too-many-requests': 'Too many attempts. Try again later',
        'auth/network-request-failed': 'Network error. Check your connection'
    };
    
    return messages[error.code] || error.message;
}

// ============================================
// 9. NAVIGATION & UI UPDATES
// ============================================

// Update navbar based on auth state
function updateNavbar() {
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.nav-buttons');
    
    if (!navLinks || !authButtons) return;
    
    if (currentUser) {
        // Add user-specific links
        const role = userProfile?.role || 'client';
        const userLinks = getNavLinksByRole(role);
        
        // Update auth buttons
        authButtons.innerHTML = `
            <a href="/profile" class="btn btn-outline">
                <i class="fas fa-user"></i> ${userProfile?.fullName || 'Profile'}
            </a>
            <button onclick="Auth.logout()" class="btn btn-primary">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="/login" class="btn btn-outline">Login</a>
            <a href="/register" class="btn btn-primary">Register</a>
        `;
    }
}

// Get navigation links by user role
function getNavLinksByRole(role) {
    const commonLinks = [
        { href: '/', label: 'Home', icon: 'fa-home' }
    ];
    
    const roleLinks = {
        super_admin: [
            { href: '/admin', label: 'Admin', icon: 'fa-crown' },
            { href: '/investors', label: 'Investors', icon: 'fa-chart-line' },
            { href: '/projects', label: 'Projects', icon: 'fa-building' },
            { href: '/transactions', label: 'Transactions', icon: 'fa-exchange-alt' },
            { href: '/users', label: 'Users', icon: 'fa-users' }
        ],
        admin: [
            { href: '/dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
            { href: '/investors', label: 'Investors', icon: 'fa-chart-line' },
            { href: '/projects', label: 'Projects', icon: 'fa-building' },
            { href: '/transactions', label: 'Transactions', icon: 'fa-exchange-alt' }
        ],
        investor: [
            { href: '/dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
            { href: '/projects', label: 'Investments', icon: 'fa-briefcase' },
            { href: '/portfolio', label: 'Portfolio', icon: 'fa-chart-pie' },
            { href: '/transactions', label: 'Transactions', icon: 'fa-history' }
        ],
        client: [
            { href: '/dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
            { href: '/profile', label: 'Profile', icon: 'fa-user' },
            { href: '/transactions', label: 'Transactions', icon: 'fa-history' }
        ]
    };
    
    return [...commonLinks, ...(roleLinks[role] || [])];
}

// Update UI for authenticated user
function updateUIForAuth() {
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'none');
}

// Update UI for guest
function updateUIForGuest() {
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'block');
}

// ============================================
// 10. ANALYTICS & TRACKING
// ============================================

// Track page view
function trackPageView(page) {
    if (typeof gtag !== 'undefined') {
        gtag('config', 'G-1SDELC2KQ8', {
            page_path: page,
            user_id: currentUser?.uid || null
        });
    }
}

// Track event
function trackEvent(action, category, label, value) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
            user_id: currentUser?.uid || null
        });
    }
}

// ============================================
// 11. PAGINATION
// ============================================
class Pagination {
    constructor(totalItems, itemsPerPage = 20, onPageChange) {
        this.totalItems = totalItems;
        this.itemsPerPage = itemsPerPage;
        this.onPageChange = onPageChange;
        this.currentPage = 1;
        this.totalPages = Math.ceil(totalItems / itemsPerPage);
    }
    
    render(container) {
        if (this.totalPages <= 1) return;
        
        let html = '<div class="pagination">';
        
        // Previous button
        html += `<button class="page-link" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>`;
        
        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || 
                (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="page-link ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += `<span class="page-link">...</span>`;
            }
        }
        
        // Next button
        html += `<button class="page-link" data-page="next" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>`;
        
        html += '</div>';
        
        container.innerHTML = html;
        
        // Add event listeners
        container.querySelectorAll('.page-link').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.hasAttribute('disabled')) return;
                
                let newPage = this.currentPage;
                
                if (btn.dataset.page === 'prev') {
                    newPage--;
                } else if (btn.dataset.page === 'next') {
                    newPage++;
                } else if (btn.dataset.page) {
                    newPage = parseInt(btn.dataset.page);
                }
                
                if (newPage >= 1 && newPage <= this.totalPages) {
                    this.currentPage = newPage;
                    this.onPageChange(this.currentPage);
                    this.render(container);
                }
            });
        });
    }
    
    getCurrentPageItems(items) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return items.slice(start, start + this.itemsPerPage);
    }
}

// ============================================
// 12. FORM HANDLING
// ============================================

// Form validation
const Validators = {
    required: (value) => value && value.trim() !== '',
    
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    
    phone: (value) => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value),
    
    password: (value) => value.length >= 6,
    
    minLength: (value, min) => value.length >= min,
    
    maxLength: (value, max) => value.length <= max,
    
    match: (value, matchValue) => value === matchValue,
    
    numeric: (value) => !isNaN(value) && isFinite(value),
    
    url: (value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }
};

// Form state management
function createForm(formId, rules = {}, onSubmit) {
    const form = document.getElementById(formId);
    if (!form) return null;
    
    const state = {
        values: {},
        errors: {},
        touched: {}
    };
    
    // Initialize state from form inputs
    form.querySelectorAll('input, select, textarea').forEach(input => {
        const name = input.name || input.id;
        if (name) {
            state.values[name] = input.value;
            state.errors[name] = '';
            state.touched[name] = false;
        }
    });
    
    // Validate field
    function validateField(name, value) {
        if (!rules[name]) return '';
        
        for (const rule of rules[name]) {
            if (rule.validator === 'required' && !Validators.required(value)) {
                return rule.message || 'This field is required';
            }
            if (rule.validator === 'email' && !Validators.email(value)) {
                return rule.message || 'Invalid email address';
            }
            if (rule.validator === 'phone' && !Validators.phone(value)) {
                return rule.message || 'Invalid phone number';
            }
            if (rule.validator === 'password' && !Validators.password(value)) {
                return rule.message || 'Password must be at least 6 characters';
            }
            if (rule.validator === 'minLength' && !Validators.minLength(value, rule.min)) {
                return rule.message || `Minimum length is ${rule.min}`;
            }
            if (rule.validator === 'maxLength' && !Validators.maxLength(value, rule.max)) {
                return rule.message || `Maximum length is ${rule.max}`;
            }
            if (rule.validator === 'match' && !Validators.match(value, rule.matchValue)) {
                return rule.message || 'Fields do not match';
            }
        }
        return '';
    }
    
    // Validate all fields
    function validateForm() {
        let isValid = true;
        state.errors = {};
        
        Object.keys(state.values).forEach(name => {
            const error = validateField(name, state.values[name]);
            if (error) {
                state.errors[name] = error;
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // Handle input change
    function handleChange(e) {
        const { name, value } = e.target;
        state.values[name || e.target.id] = value;
        state.touched[name || e.target.id] = true;
        state.errors[name || e.target.id] = validateField(name, value);
        
        // Update UI
        const input = e.target;
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (state.errors[name]) {
            input.classList.add('error');
            if (errorDiv) errorDiv.textContent = state.errors[name];
        } else {
            input.classList.remove('error');
            if (errorDiv) errorDiv.textContent = '';
        }
    }
    
    // Handle form submit
    async function handleSubmit(e) {
        e.preventDefault();
        
        if (validateForm()) {
            if (onSubmit) {
                await onSubmit(state.values);
            }
        } else {
            showToast('Please fix the errors in the form', 'error');
        }
    }
    
    // Add event listeners
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', handleChange);
        input.addEventListener('blur', handleChange);
    });
    
    form.addEventListener('submit', handleSubmit);
    
    return {
        getValues: () => ({ ...state.values }),
        setValue: (name, value) => {
            state.values[name] = value;
            const input = form.querySelector(`[name="${name}"], #${name}`);
            if (input) input.value = value;
        },
        reset: () => {
            form.reset();
            state.values = {};
            state.errors = {};
            state.touched = {};
        },
        isValid: validateForm
    };
}

// ============================================
// 13. DATA TABLES
// ============================================
function createDataTable(containerId, columns, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    let currentData = [...data];
    let currentPage = 1;
    const pageSize = options.pageSize || 20;
    
    function render() {
        const start = (currentPage - 1) * pageSize;
        const pageData = currentData.slice(start, start + pageSize);
        const totalPages = Math.ceil(currentData.length / pageSize);
        
        let html = '<table><thead><tr>';
        
        // Headers
        columns.forEach(col => {
            html += `<th>${col.label || col.field}</th>`;
        });
        html += '<th>Actions</th></tr></thead><tbody>';
        
        // Rows
        pageData.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const value = row[col.field];
                html += `<td>${col.formatter ? col.formatter(value, row) : value}</td>`;
            });
            
            // Actions
            html += '<td class="table-actions">';
            if (options.onView) {
                html += `<button class="btn btn-sm btn-outline" onclick="options.onView('${row.id}')">
                    <i class="fas fa-eye"></i>
                </button>`;
            }
            if (options.onEdit) {
                html += `<button class="btn btn-sm btn-outline-accent" onclick="options.onEdit('${row.id}')">
                    <i class="fas fa-edit"></i>
                </button>`;
            }
            if (options.onDelete) {
                html += `<button class="btn btn-sm btn-outline-danger" onclick="options.onDelete('${row.id}')">
                    <i class="fas fa-trash"></i>
                </button>`;
            }
            html += '</td></tr>';
        });
        
        html += '</tbody></table>';
        
        // Pagination
        if (totalPages > 1) {
            html += '<div class="pagination">';
            for (let i = 1; i <= totalPages; i++) {
                html += `<button class="page-link ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
            html += '</div>';
        }
        
        container.innerHTML = html;
        
        // Add pagination listeners
        container.querySelectorAll('.page-link').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page);
                render();
            });
        });
    }
    
    render();
    
    return {
        updateData: (newData) => {
            currentData = [...newData];
            currentPage = 1;
            render();
        },
        getCurrentPage: () => currentPage,
        getTotalPages: () => Math.ceil(currentData.length / pageSize)
    };
}

// ============================================
// 14. INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Create toast container if not exists
    if (!document.getElementById('toastContainer')) {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }
    
    // Mobile menu toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuBtn.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active') && 
            !e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-btn')) {
            navMenu.classList.remove('active');
            if (menuBtn) menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Auto-hide alerts after 5 seconds
    document.querySelectorAll('.alert').forEach(alert => {
        setTimeout(() => {
            if (alert.parentElement) alert.remove();
        }, 5000);
    });
});

// ============================================
// 15. EXPORTS
// ============================================
window.TAAGC = {
    Auth,
    DB,
    Storage,
    Utils: {
        showToast,
        showModal,
        hideModal,
        formatCurrency,
        formatDate,
        timeAgo,
        createForm,
        createDataTable,
        Pagination,
        Validators
    },
    trackEvent,
    currentUser: () => currentUser,
    userProfile: () => userProfile
};

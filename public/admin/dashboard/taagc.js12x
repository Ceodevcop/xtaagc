// ============================================
// TAAGC SUPER ADMIN DASHBOARD
// Complete REST API Integration with Firebase
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOcCDPqRSlAMJJBEeNchTA1qO9tl9Nldw",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:android:0c54368d54e260cba98f0c"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });

// ============================================
// API SERVICE - RESTful Firebase Integration
// ============================================
const API = {
    // Base endpoints
    endpoints: {
        users: 'users',
        admins: 'admins',
        investors: 'investors',
        clients: 'clients',
        events: 'events',
        testimonials: 'testimonials',
        opportunities: 'opportunities',
        announcements: 'announcements',
        settings: 'settings',
        audit: 'audit',
        backups: 'backups',
        notifications: 'notifications'
    },

    // Generic GET request
    async get(collection, id = null) {
        try {
            if (id) {
                const doc = await db.collection(collection).doc(id).get();
                return doc.exists ? { id: doc.id, ...doc.data() } : null;
            } else {
                const snapshot = await db.collection(collection).get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (error) {
            console.error(`API GET Error (${collection}):`, error);
            throw error;
        }
    },

    // Generic POST request (Create)
    async post(collection, data) {
        try {
            // Add timestamps
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            const docRef = await db.collection(collection).add(data);
            return { id: docRef.id, ...data };
        } catch (error) {
            console.error(`API POST Error (${collection}):`, error);
            throw error;
        }
    },

    // Generic PUT request (Update)
    async put(collection, id, data) {
        try {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(collection).doc(id).update(data);
            return { id, ...data };
        } catch (error) {
            console.error(`API PUT Error (${collection}):`, error);
            throw error;
        }
    },

    // Generic PATCH request (Partial Update)
    async patch(collection, id, data) {
        try {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(collection).doc(id).update(data);
            return { id, ...data };
        } catch (error) {
            console.error(`API PATCH Error (${collection}):`, error);
            throw error;
        }
    },

    // Generic DELETE request
    async delete(collection, id) {
        try {
            await db.collection(collection).doc(id).delete();
            return { id, deleted: true };
        } catch (error) {
            console.error(`API DELETE Error (${collection}):`, error);
            throw error;
        }
    },

    // Bulk operations
    async bulkPost(collection, items) {
        try {
            const batch = db.batch();
            const results = [];
            
            items.forEach(item => {
                const docRef = db.collection(collection).doc();
                item.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                item.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                batch.set(docRef, item);
                results.push({ id: docRef.id, ...item });
            });
            
            await batch.commit();
            return results;
        } catch (error) {
            console.error(`API Bulk POST Error (${collection}):`, error);
            throw error;
        }
    },

    async bulkPut(collection, items) {
        try {
            const batch = db.batch();
            
            items.forEach(item => {
                const { id, ...data } = item;
                data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                batch.update(db.collection(collection).doc(id), data);
            });
            
            await batch.commit();
            return items;
        } catch (error) {
            console.error(`API Bulk PUT Error (${collection}):`, error);
            throw error;
        }
    },

    async bulkDelete(collection, ids) {
        try {
            const batch = db.batch();
            ids.forEach(id => {
                batch.delete(db.collection(collection).doc(id));
            });
            await batch.commit();
            return { deleted: ids.length };
        } catch (error) {
            console.error(`API Bulk DELETE Error (${collection}):`, error);
            throw error;
        }
    },

    // Query with filters
    async query(collection, filters = {}) {
        try {
            let query = db.collection(collection);
            
            Object.entries(filters).forEach(([field, value]) => {
                if (value) {
                    query = query.where(field, '==', value);
                }
            });
            
            if (filters.orderBy) {
                query = query.orderBy(filters.orderBy, filters.orderDir || 'asc');
            }
            
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`API Query Error (${collection}):`, error);
            throw error;
        }
    },

    // Search
    async search(collection, field, searchTerm, limit = 10) {
        try {
            const snapshot = await db.collection(collection)
                .orderBy(field)
                .startAt(searchTerm)
                .endAt(searchTerm + '\uf8ff')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`API Search Error (${collection}):`, error);
            throw error;
        }
    },

    // Count documents
    async count(collection, filters = {}) {
        try {
            let query = db.collection(collection);
            
            Object.entries(filters).forEach(([field, value]) => {
                if (value) {
                    query = query.where(field, '==', value);
                }
            });
            
            const snapshot = await query.get();
            return snapshot.size;
        } catch (error) {
            console.error(`API Count Error (${collection}):`, error);
            throw error;
        }
    },

    // Aggregate
    async aggregate(collection, field, filters = {}) {
        try {
            let query = db.collection(collection);
            
            Object.entries(filters).forEach(([field, value]) => {
                if (value) {
                    query = query.where(field, '==', value);
                }
            });
            
            const snapshot = await query.get();
            let sum = 0;
            let count = 0;
            
            snapshot.forEach(doc => {
                const val = doc.data()[field];
                if (typeof val === 'number') {
                    sum += val;
                    count++;
                }
            });
            
            return {
                sum,
                average: count > 0 ? sum / count : 0,
                count,
                min: Math.min(...snapshot.docs.map(d => d.data()[field]).filter(v => typeof v === 'number')),
                max: Math.max(...snapshot.docs.map(d => d.data()[field]).filter(v => typeof v === 'number'))
            };
        } catch (error) {
            console.error(`API Aggregate Error (${collection}):`, error);
            throw error;
        }
    }
};

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentUser = null;
let currentUserData = null;
let allUsers = [];
let selectedUsers = new Set();
let userToDelete = null;
let selectedRole = 'client';
let dataTables = {};

// ============================================
// AUTH STATE CHECK
// ============================================
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = '/xtaagc/admin-login';
        return;
    }

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists || userDoc.data().role !== 'super_admin') {
            await auth.signOut();
            window.location.href = '/xtaagc/admin-login';
            return;
        }

        currentUser = user;
        currentUserData = userDoc.data();
        
        // Update UI with user info
        document.getElementById('adminName').textContent = currentUserData.fullName || 'Super Admin';
        document.getElementById('adminEmail').textContent = currentUser.email;
        document.getElementById('adminAvatar').textContent = (currentUserData.fullName || 'SA').charAt(0).toUpperCase();

        // Load initial data
        await Promise.all([
            loadUsers(),
            loadStats(),
            loadNotifications()
        ]);
        
    } catch (error) {
        console.error('Auth error:', error);
        showToast('Authentication error', 'error');
        await auth.signOut();
        window.location.href = '/xtaagc/admin-login';
    }
});

// ============================================
// USER MANAGEMENT API
// ============================================
async function loadUsers() {
    try {
        const users = await API.query('users', { orderBy: 'createdAt', orderDir: 'desc' });
        allUsers = users;
        displayUsers(users);
        updateStats();
        
        // Update sidebar badges
        const roleCounts = await getRoleCounts();
        document.querySelectorAll('.sidebar-menu-link .badge').forEach(badge => {
            const text = badge.closest('a')?.querySelector('span')?.textContent;
            if (text === 'Users') badge.textContent = users.length;
            else if (text === 'Admins') badge.textContent = roleCounts.admin + roleCounts.super_admin;
            else if (text === 'Investors') badge.textContent = roleCounts.investor;
            else if (text === 'Clients') badge.textContent = roleCounts.client;
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error loading users', 'error');
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 50px;">
                    <i class="fas fa-users" style="font-size: 48px; color: #c19a6b;"></i>
                    <p style="margin-top: 20px;">No users found</p>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    users.forEach(user => {
        const roleClass = `role-${user.role?.toLowerCase().replace('_', '') || 'client'}`;
        const statusClass = `status-${user.status || 'pending'}`;
        const joinedDate = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A';
        const lastActive = user.lastActive ? new Date(user.lastActive.toDate()).toLocaleDateString() : 'Never';
        
        html += `
            <tr>
                <td class="checkbox-column">
                    <input type="checkbox" class="user-checkbox" value="${user.id}" onchange="updateSelection(this)">
                </td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${(user.fullName || 'U').charAt(0)}</div>
                        <div class="user-info">
                            <h4>${user.fullName || 'No Name'}</h4>
                            <p>ID: ${user.id.slice(0, 8)}...</p>
                        </div>
                    </div>
                </td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="role-badge ${roleClass}">${user.role || 'client'}</span></td>
                <td><span class="status-badge ${statusClass}">${user.status || 'pending'}</span></td>
                <td>${joinedDate}</td>
                <td>${lastActive}</td>
                <td>
                    <div class="action-icons">
                        <i class="fas fa-edit" onclick="openEditUserModal('${user.id}')" title="Edit"></i>
                        <i class="fas fa-key" onclick="resetPassword('${user.id}')" title="Reset Password"></i>
                        <i class="fas fa-ban" onclick="suspendUser('${user.id}')" title="Suspend"></i>
                        <i class="fas fa-trash" onclick="openDeleteModal('${user.id}')" title="Delete"></i>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    document.getElementById('selectAll').checked = false;
    selectedUsers.clear();
    updateBulkActionsBar();
}

async function getRoleCounts() {
    try {
        const users = await API.get('users');
        const counts = { super_admin: 0, admin: 0, investor: 0, client: 0 };
        
        users.forEach(user => {
            if (counts.hasOwnProperty(user.role)) {
                counts[user.role]++;
            }
        });
        
        return counts;
    } catch (error) {
        console.error('Error getting role counts:', error);
        return { super_admin: 0, admin: 0, investor: 0, client: 0 };
    }
}

async function loadStats() {
    try {
        const users = await API.get('users');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        let activeToday = 0;
        let newThisMonth = 0;
        let pendingKYC = 0;

        users.forEach(user => {
            if (user.lastActive) {
                const lastActive = user.lastActive.toDate();
                if (lastActive >= today) activeToday++;
            }

            if (user.createdAt) {
                const created = user.createdAt.toDate();
                if (created >= monthAgo) newThisMonth++;
            }

            if (user.kycStatus === 'pending_review') pendingKYC++;
        });

        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('activeToday').textContent = activeToday;
        document.getElementById('newThisMonth').textContent = newThisMonth;
        document.getElementById('pendingKYC').textContent = pendingKYC;

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStats() {
    const total = allUsers.length;
    const active = allUsers.filter(u => u.status === 'active').length;
    const pending = allUsers.filter(u => u.kycStatus === 'pending_review').length;
    
    document.getElementById('totalUsers').textContent = total;
    document.getElementById('activeToday').textContent = active;
    document.getElementById('pendingKYC').textContent = pending;
}

// ============================================
// FILTER FUNCTIONS
// ============================================
async function applyFilters() {
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const verificationFilter = document.getElementById('verificationFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    let filters = {};
    
    if (roleFilter !== 'all') filters.role = roleFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    
    try {
        let filtered = await API.query('users', filters);
        
        if (verificationFilter === 'verified') {
            filtered = filtered.filter(u => u.emailVerified === true);
        } else if (verificationFilter === 'unverified') {
            filtered = filtered.filter(u => !u.emailVerified);
        } else if (verificationFilter === 'kyc_pending') {
            filtered = filtered.filter(u => u.kycStatus === 'pending_review');
        } else if (verificationFilter === 'kyc_approved') {
            filtered = filtered.filter(u => u.kycStatus === 'approved');
        }

        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate = new Date();

            if (dateFilter === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (dateFilter === 'week') {
                startDate.setDate(now.getDate() - 7);
            } else if (dateFilter === 'month') {
                startDate.setMonth(now.getMonth() - 1);
            } else if (dateFilter === 'year') {
                startDate.setFullYear(now.getFullYear() - 1);
            }

            filtered = filtered.filter(u => {
                if (!u.createdAt) return false;
                const created = u.createdAt.toDate();
                return created >= startDate;
            });
        }

        displayUsers(filtered);
        
    } catch (error) {
        console.error('Error applying filters:', error);
        showToast('Error applying filters', 'error');
    }
}

function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = allUsers.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.phone && user.phone.includes(searchTerm))
    );
    
    displayUsers(filtered);
}

async function refreshData() {
    showToast('Refreshing data...', 'info');
    await loadUsers();
    await loadStats();
}

// ============================================
// SELECTION FUNCTIONS
// ============================================
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    selectedUsers.clear();
    
    checkboxes.forEach(cb => {
        cb.checked = selectAll;
        if (selectAll) {
            selectedUsers.add(cb.value);
        }
    });
    
    updateBulkActionsBar();
}

function updateSelection(checkbox) {
    if (checkbox.checked) {
        selectedUsers.add(checkbox.value);
    } else {
        selectedUsers.delete(checkbox.value);
        document.getElementById('selectAll').checked = false;
    }
    
    updateBulkActionsBar();
}

function updateBulkActionsBar() {
    const bar = document.getElementById('bulkActionsBar');
    const countSpan = document.getElementById('selectedCount');
    const count = selectedUsers.size;
    
    if (count > 0) {
        bar.classList.add('active');
        countSpan.textContent = `${count} user${count > 1 ? 's' : ''} selected`;
    } else {
        bar.classList.remove('active');
    }
}

function clearSelection() {
    document.querySelectorAll('.user-checkbox').forEach(cb => {
        cb.checked = false;
    });
    selectedUsers.clear();
    document.getElementById('selectAll').checked = false;
    updateBulkActionsBar();
}

// ============================================
// BULK ACTIONS
// ============================================
function bulkChangeRole() {
    if (selectedUsers.size === 0) return;
    
    document.getElementById('bulkUserCount').textContent = 
        `Change role for ${selectedUsers.size} selected user${selectedUsers.size > 1 ? 's' : ''}`;
    openModal('bulkRoleModal');
}

function bulkChangeStatus() {
    if (selectedUsers.size === 0) return;
    
    document.getElementById('bulkStatusUserCount').textContent = 
        `Change status for ${selectedUsers.size} selected user${selectedUsers.size > 1 ? 's' : ''}`;
    openModal('bulkStatusModal');
}

async function bulkDelete() {
    if (selectedUsers.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''}?`)) {
        return;
    }

    showToast(`Deleting ${selectedUsers.size} users...`, 'info');
    
    try {
        await API.bulkDelete('users', Array.from(selectedUsers));
        
        await logAudit('bulk_delete', `Deleted ${selectedUsers.size} users`);
        
        showToast(`Successfully deleted ${selectedUsers.size} users`, 'success');
        clearSelection();
        loadUsers();
        loadStats();
        
    } catch (error) {
        console.error('Error bulk deleting:', error);
        showToast('Error deleting users', 'error');
    }
}

async function confirmBulkRoleChange() {
    const newRole = document.getElementById('bulkNewRole').value;
    const notify = document.getElementById('notifyUsers').checked;
    
    showToast('Updating roles...', 'info');
    
    try {
        const updates = Array.from(selectedUsers).map(userId => ({
            id: userId,
            role: newRole
        }));
        
        await API.bulkPut('users', updates);
        
        await logAudit('bulk_role_change', `Changed role to ${newRole} for ${selectedUsers.size} users`);
        
        showToast(`Updated roles for ${selectedUsers.size} users`, 'success');
        closeModal('bulkRoleModal');
        clearSelection();
        loadUsers();
        
    } catch (error) {
        console.error('Error updating roles:', error);
        showToast('Error updating roles', 'error');
    }
}

async function confirmBulkStatusChange() {
    const newStatus = document.getElementById('bulkNewStatus').value;
    
    showToast('Updating status...', 'info');
    
    try {
        const updates = Array.from(selectedUsers).map(userId => ({
            id: userId,
            status: newStatus
        }));
        
        await API.bulkPut('users', updates);
        
        await logAudit('bulk_status_change', `Changed status to ${newStatus} for ${selectedUsers.size} users`);
        
        showToast(`Updated status for ${selectedUsers.size} users`, 'success');
        closeModal('bulkStatusModal');
        clearSelection();
        loadUsers();
        
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Error updating status', 'error');
    }
}

// ============================================
// USER CRUD OPERATIONS
// ============================================
function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.getElementById(`role${role.charAt(0).toUpperCase() + role.slice(1)}`).classList.add('selected');
}

async function addUser() {
    const fullName = document.getElementById('newFullName').value;
    const email = document.getElementById('newEmail').value;
    const phone = document.getElementById('newPhone').value;
    const password = document.getElementById('newPassword').value;
    const status = document.getElementById('newStatus').value;
    const sendEmail = document.getElementById('sendWelcomeEmail').checked;

    if (!fullName || !email || !password) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    showToast('Creating user...', 'info');

    try {
        // Create auth user
        const userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const uid = userCred.user.uid;

        // Update profile
        await userCred.user.updateProfile({ displayName: fullName });

        // Save to Firestore using API
        const userData = {
            fullName,
            email,
            phone,
            role: selectedRole,
            status,
            emailVerified: false,
            createdBy: currentUser.uid,
            uid
        };
        
        await API.put('users', uid, userData);

        // Send welcome email if requested
        if (sendEmail) {
            await userCred.user.sendEmailVerification();
        }

        await logAudit('user_created', `Created user: ${email} (${selectedRole})`);

        showToast('User created successfully', 'success');
        closeModal('addUserModal');
        loadUsers();
        loadStats();

    } catch (error) {
        console.error('Error creating user:', error);
        showToast(error.message, 'error');
    }
}

async function openEditUserModal(userId) {
    try {
        const user = await API.get('users', userId);
        if (!user) return;

        document.getElementById('editUserId').value = user.id;
        document.getElementById('editFullName').value = user.fullName || '';
        document.getElementById('editEmail').value = user.email || '';
        document.getElementById('editPhone').value = user.phone || '';
        document.getElementById('editRole').value = user.role || 'client';
        document.getElementById('editStatus').value = user.status || 'pending';
        document.getElementById('editEmailVerified').value = user.emailVerified ? 'true' : 'false';

        openModal('editUserModal');
        
    } catch (error) {
        console.error('Error loading user:', error);
        showToast('Error loading user', 'error');
    }
}

async function updateUser() {
    const userId = document.getElementById('editUserId').value;
    const fullName = document.getElementById('editFullName').value;
    const phone = document.getElementById('editPhone').value;
    const role = document.getElementById('editRole').value;
    const status = document.getElementById('editStatus').value;
    const emailVerified = document.getElementById('editEmailVerified').value === 'true';

    showToast('Updating user...', 'info');

    try {
        const updateData = {
            fullName,
            phone,
            role,
            status,
            emailVerified,
            updatedBy: currentUser.uid
        };
        
        await API.patch('users', userId, updateData);

        await logAudit('user_updated', `Updated user: ${userId}`);

        showToast('User updated successfully', 'success');
        closeModal('editUserModal');
        loadUsers();

    } catch (error) {
        console.error('Error updating user:', error);
        showToast(error.message, 'error');
    }
}

function openDeleteModal(userId) {
    userToDelete = userId;
    document.getElementById('deleteMessage').textContent = 'Are you sure you want to delete this user?';
    openModal('deleteModal');
}

async function confirmDelete() {
    if (!userToDelete) return;

    showToast('Deleting user...', 'info');

    try {
        await API.delete('users', userToDelete);
        
        await logAudit('user_deleted', `Deleted user: ${userToDelete}`);

        showToast('User deleted successfully', 'success');
        closeModal('deleteModal');
        loadUsers();
        loadStats();

    } catch (error) {
        console.error('Error deleting user:', error);
        showToast(error.message, 'error');
    }
}

async function resetPassword(userId) {
    try {
        const user = await API.get('users', userId);
        if (!user || !user.email) return;

        if (!confirm(`Send password reset email to ${user.email}?`)) return;

        showToast('Sending reset email...', 'info');

        await firebase.auth().sendPasswordResetEmail(user.email);
        
        await logAudit('password_reset', `Password reset for: ${user.email}`);
        
        showToast('Password reset email sent', 'success');
        
    } catch (error) {
        console.error('Error resetting password:', error);
        showToast(error.message, 'error');
    }
}

async function suspendUser(userId) {
    if (!confirm('Suspend this user?')) return;

    showToast('Suspending user...', 'info');

    try {
        await API.patch('users', userId, {
            status: 'suspended',
            suspendedAt: firebase.firestore.FieldValue.serverTimestamp(),
            suspendedBy: currentUser.uid
        });

        await logAudit('user_suspended', `Suspended user: ${userId}`);

        showToast('User suspended', 'success');
        loadUsers();

    } catch (error) {
        console.error('Error suspending user:', error);
        showToast(error.message, 'error');
    }
}

// ============================================
// IMPORT/EXPORT FUNCTIONS
// ============================================
function downloadTemplate() {
    const headers = ['fullName', 'email', 'phone', 'role', 'status'];
    const csv = headers.join(',');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

async function importUsers() {
    const file = document.getElementById('importFile').files[0];
    if (!file) {
        showToast('Please select a file', 'error');
        return;
    }

    showToast('Importing users...', 'info');

    const reader = new FileReader();
    reader.onload = async function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        let success = 0;
        let errors = 0;
        const importResults = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',');
            const userData = {};
            
            headers.forEach((header, index) => {
                userData[header.trim()] = values[index]?.trim();
            });

            try {
                // Check if user exists by email
                const existingUsers = await API.query('users', { email: userData.email });
                
                if (existingUsers.length === 0) {
                    // Create new user
                    userData.importedAt = firebase.firestore.FieldValue.serverTimestamp();
                    userData.importedBy = currentUser.uid;
                    
                    await API.post('users', userData);
                    importResults.push({ action: 'created', email: userData.email });
                    success++;
                } else {
                    // Update existing user
                    const userId = existingUsers[0].id;
                    await API.patch('users', userId, userData);
                    importResults.push({ action: 'updated', email: userData.email });
                    success++;
                }
            } catch (error) {
                console.error('Error importing user:', error);
                errors++;
                importResults.push({ action: 'failed', email: userData.email, error: error.message });
            }
        }

        // Log import results
        await logAudit('users_imported', `Imported ${success} users, ${errors} errors`);

        showToast(`Imported ${success} users, ${errors} errors`, 'success');
        closeModal('importModal');
        loadUsers();
        loadStats();
    };

    reader.readAsText(file);
}

function exportUsers() {
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let usersToExport = [...allUsers];
    
    if (roleFilter !== 'all') {
        usersToExport = usersToExport.filter(u => u.role === roleFilter);
    }
    if (statusFilter !== 'all') {
        usersToExport = usersToExport.filter(u => u.status === statusFilter);
    }

    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Role', 'Status', 'Email Verified', 'KYC Status', 'Created At', 'Last Active'];
    const csv = [headers.join(',')];

    usersToExport.forEach(user => {
        const row = [
            user.id,
            `"${user.fullName || ''}"`,
            `"${user.email || ''}"`,
            `"${user.phone || ''}"`,
            user.role || '',
            user.status || '',
            user.emailVerified ? 'Yes' : 'No',
            user.kycStatus || 'pending',
            user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : '',
            user.lastActive ? new Date(user.lastActive.toDate()).toLocaleDateString() : ''
        ];
        csv.push(row.join(','));
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================
async function loadNotifications() {
    try {
        const notifications = await API.query('notifications', { 
            read: false,
            orderBy: 'createdAt',
            orderDir: 'desc',
            limit: 10
        });
        
        document.getElementById('notificationCount').textContent = notifications.length;
        
        const list = document.getElementById('notificationsList');
        if (notifications.length === 0) {
            list.innerHTML = '<div class="notification-item">No new notifications</div>';
            return;
        }
        
        let html = '';
        notifications.forEach(notif => {
            const time = notif.createdAt ? new Date(notif.createdAt.toDate()).toLocaleString() : 'N/A';
            html += `
                <div class="notification-item unread" onclick="markNotificationRead('${notif.id}')">
                    <strong>${notif.title || 'Notification'}</strong>
                    <p>${notif.message || ''}</p>
                    <small>${time}</small>
                </div>
            `;
        });
        
        list.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function markNotificationRead(id) {
    try {
        await API.patch('notifications', id, { read: true });
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification read:', error);
    }
}

async function markAllNotificationsRead() {
    try {
        const notifications = await API.query('notifications', { read: false });
        
        const updates = notifications.map(n => ({
            id: n.id,
            read: true
        }));
        
        if (updates.length > 0) {
            await API.bulkPut('notifications', updates);
        }
        
        loadNotifications();
        
    } catch (error) {
        console.error('Error marking all notifications read:', error);
    }
}

// ============================================
// AUDIT LOG FUNCTIONS
// ============================================
async function logAudit(action, details) {
    try {
        await API.post('audit', {
            action,
            details,
            user: currentUser?.email || 'system',
            userId: currentUser?.uid || 'system',
            ip: await getClientIP(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging audit:', error);
    }
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'unknown';
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openAddUserModal() {
    selectedRole = 'client';
    document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('roleClient').classList.add('selected');
    document.getElementById('addUserForm').reset();
    openModal('addUserModal');
}

function closeAddUserModal() {
    closeModal('addUserModal');
}

function closeEditUserModal() {
    closeModal('editUserModal');
}

function openImportModal() {
    openModal('importModal');
}

function closeImportModal() {
    closeModal('importModal');
}

function openBulkRoleModal() {
    openModal('bulkRoleModal');
}

function closeBulkRoleModal() {
    closeModal('bulkRoleModal');
}

function openBulkStatusModal() {
    openModal('bulkStatusModal');
}

function closeBulkStatusModal() {
    closeModal('bulkStatusModal');
}

function closeDeleteModal() {
    closeModal('deleteModal');
    userToDelete = null;
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const msg = document.getElementById('toastMessage');
    
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    icon.className = `fas ${icons[type] || icons.info}`;
    msg.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// USER MENU TOGGLE
// ============================================
function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('show');
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.admin-user') && !e.target.closest('.dropdown-menu')) {
        document.getElementById('userMenu').classList.remove('show');
    }
    if (!e.target.closest('.notifications') && !e.target.closest('.notifications-panel')) {
        document.getElementById('notificationsPanel').classList.remove('show');
    }
});

// Toggle notifications panel
document.querySelector('.admin-notifications')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notificationsPanel').classList.toggle('show');
});

// ============================================
// LOGOUT FUNCTION
// ============================================
async function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    try {
        await logAudit('logout', 'User logged out');
        await auth.signOut();
        window.location.href = '/xtaagc/admin-login';
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logging out', 'error');
    }
}

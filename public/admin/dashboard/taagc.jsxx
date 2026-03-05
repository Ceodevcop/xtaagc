// ============================================
// FIREBASE CONFIGURATION
// ============================================
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
const storage = firebase.storage();

// Enable offline persistence
db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentUser = null;
let currentUserData = null;
let currentSection = 'dashboard';
let growthChart = null;
let distributionChart = null;
let deleteCallback = null;
let allUsers = [];

// DataTable instances tracker
const dataTables = {};

// ============================================
// SAFE DATATABLE INITIALIZATION
// ============================================
function initDataTable(tableId, options = {}) {
    // Check if jQuery and DataTables are available
    if (typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') {
        console.error('DataTables not loaded');
        return null;
    }

    const tableElement = document.querySelector(`#${tableId}`);
    if (!tableElement) {
        console.warn(`Table #${tableId} not found`);
        return null;
    }
    
    // Check if table has data
    const tbody = tableElement.querySelector('tbody');
    if (!tbody || tbody.children.length === 0 || tbody.innerHTML.includes('Loading')) {
        // Retry after a short delay
        setTimeout(() => initDataTable(tableId, options), 200);
        return null;
    }
    
    // Destroy existing instance if it exists
    if (dataTables[tableId]) {
        try {
            if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
                $(`#${tableId}`).DataTable().destroy();
            }
        } catch (e) {
            console.log('Destroying existing table:', tableId);
        }
        delete dataTables[tableId];
    }
    
    // Default options
    const defaultOptions = {
        responsive: true,
        pageLength: 25,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        order: [[0, 'desc']],
        autoWidth: false,
        deferRender: true,
        destroy: true,
        retrieve: false
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
                $(`#${tableId}`).DataTable().destroy();
            }
            dataTables[tableId] = $(`#${tableId}`).DataTable(finalOptions);
            console.log(`✅ DataTable initialized: ${tableId}`);
        }, 50);
        
        return dataTables[tableId];
    } catch (error) {
        console.error(`Error initializing DataTable ${tableId}:`, error);
        return null;
    }
}

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
        document.getElementById('userName').textContent = currentUserData.fullName || 'Super Admin';
        document.getElementById('userAvatar').textContent = (currentUserData.fullName || 'SA').charAt(0);
        document.getElementById('profileAvatar').textContent = (currentUserData.fullName || 'SA').charAt(0);
        document.getElementById('profileName').textContent = currentUserData.fullName || 'Ahmad Hamza';
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profileFullName').value = currentUserData.fullName || '';
        document.getElementById('profilePhone').value = currentUserData.phone || '';
        
        // Load initial data
        await Promise.all([
            loadDashboardData(),
            loadNotifications()
        ]);
        
    } catch (error) {
        console.error('Auth error:', error);
        await auth.signOut();
        window.location.href = '/xtaagc/admin-login';
    }
});

// ============================================
// SECTION NAVIGATION
// ============================================
document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        loadSection(section);
    });
});

function loadSection(section) {
    // Update active menu
    document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Show selected section
    document.getElementById(`${section}Section`).classList.add('active');
    
    // Update title
    const titles = {
        dashboard: 'Dashboard',
        users: 'User Management',
        admins: 'Admin Management',
        investors: 'Investor Management',
        clients: 'Client Management',
        events: 'Event Management',
        testimonials: 'Testimonial Management',
        opportunities: 'Investment Opportunities',
        announcements: 'Announcements',
        profile: 'My Profile',
        settings: 'System Settings',
        audit: 'Audit Logs',
        backup: 'Backup & Restore'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    currentSection = section;
    
    // Load section-specific data
    switch(section) {
        case 'users': loadUsers(); break;
        case 'admins': loadUsersByRole('admin'); break;
        case 'investors': loadUsersByRole('investor'); break;
        case 'clients': loadUsersByRole('client'); break;
        case 'events': loadEvents(); break;
        case 'testimonials': loadTestimonials(); break;
        case 'opportunities': loadOpportunities(); break;
        case 'announcements': loadAnnouncements(); break;
        case 'audit': loadAuditLogs(); break;
        case 'backup': loadBackupInfo(); break;
        case 'settings': loadSettings(); break;
        case 'profile': loadProfile(); break;
    }
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================
async function loadDashboardData() {
    try {
        const usersSnapshot = await db.collection('users').get();
        const today = new Date();
        today.setHours(0,0,0,0);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        let total = 0;
        let activeToday = 0;
        let newThisMonth = 0;
        let pendingKYC = 0;
        let roleCounts = { super_admin: 0, admin: 0, investor: 0, client: 0 };
        
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            total++;
            
            if (roleCounts.hasOwnProperty(user.role)) {
                roleCounts[user.role]++;
            }
            
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
        
        // Update stats
        document.getElementById('totalUsers').textContent = total;
        document.getElementById('activeToday').textContent = activeToday;
        document.getElementById('newThisMonth').textContent = newThisMonth;
        document.getElementById('pendingKYC').textContent = pendingKYC;
        
        document.getElementById('userGrowth').textContent = `+${Math.round((newThisMonth/total)*100)}%`;
        document.getElementById('activePercent').textContent = `${Math.round((activeToday/total)*100)}%`;
        document.getElementById('monthlyGrowth').textContent = `+${Math.round((newThisMonth/total)*100)}%`;
        
        // Load recent users
        await loadRecentUsers();
        
        // Initialize charts
        initGrowthChart();
        initDistributionChart(roleCounts);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadRecentUsers() {
    try {
        const snapshot = await db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        let html = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const joined = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A';
            html += `
                <tr>
                    <td><div class="user-cell"><div class="user-avatar-sm">${(user.fullName || 'U').charAt(0)}</div> ${user.fullName || 'N/A'}</div></td>
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="badge badge-${user.role || 'client'}">${user.role || 'client'}</span></td>
                    <td><span class="badge badge-${user.status || 'pending'}">${user.status || 'pending'}</span></td>
                    <td>${joined}</td>
                </tr>
            `;
        });
        
        document.getElementById('recentUsersBody').innerHTML = html || '<tr><td colspan="5">No users found</td></tr>';
        
    } catch (error) {
        console.error('Error loading recent users:', error);
    }
}

function initGrowthChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    if (growthChart) growthChart.destroy();
    
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'New Users',
                data: [5, 8, 12, 7, 15, 20, 18],
                borderColor: '#c19a6b',
                backgroundColor: 'rgba(193, 154, 107, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function initDistributionChart(roleCounts) {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    if (distributionChart) distributionChart.destroy();
    
    distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Super Admin', 'Admin', 'Investor', 'Client'],
            datasets: [{
                data: [
                    roleCounts.super_admin,
                    roleCounts.admin,
                    roleCounts.investor,
                    roleCounts.client
                ],
                backgroundColor: ['#e53e3e', '#f59e0b', '#10b981', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading users...</td></tr>';
    
    try {
        const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
        allUsers = [];
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="8">No users found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const user = { id: doc.id, ...doc.data() };
            allUsers.push(user);
            
            const joined = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A';
            const verified = user.emailVerified ? 
                '<span class="badge badge-verified">Verified</span>' : 
                '<span class="badge badge-unverified">Unverified</span>';
            
            html += `
                <tr>
                    <td><div class="user-cell"><div class="user-avatar-sm">${(user.fullName || 'U').charAt(0)}</div> ${user.fullName || 'N/A'}</div></td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td><span class="badge badge-${user.role || 'client'}">${user.role || 'client'}</span></td>
                    <td><span class="badge badge-${user.status || 'pending'}">${user.status || 'pending'}</span></td>
                    <td>${verified}</td>
                    <td>${joined}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-edit" onclick="openEditUserModal('${doc.id}')" title="Edit"></i>
                            <i class="fas fa-key" onclick="resetPassword('${doc.id}')" title="Reset Password"></i>
                            <i class="fas fa-ban" onclick="toggleUserStatus('${doc.id}')" title="Toggle Status"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('user', '${doc.id}')" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        initDataTable('usersTable', { order: [[6, 'desc']] });
        
    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = '<tr><td colspan="8">Error loading users</td></tr>';
    }
}

async function loadUsersByRole(role) {
    const tableId = role === 'admin' ? 'admins' : role === 'investor' ? 'investors' : 'clients';
    const tbody = document.getElementById(`${tableId}TableBody`);
    tbody.innerHTML = `<tr><td colspan="6" class="loading">Loading ${role}s...</td></tr>`;
    
    try {
        const snapshot = await db.collection('users')
            .where('role', '==', role)
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="6">No ${role}s found</td></tr>`;
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const joined = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A';
            
            if (role === 'investor') {
                html += `
                    <tr>
                        <td><div class="user-cell"><div class="user-avatar-sm">${(user.fullName || 'U').charAt(0)}</div> ${user.fullName || 'N/A'}</div></td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${user.investorData?.investmentRange || 'N/A'}</td>
                        <td><span class="badge badge-${user.status || 'pending'}">${user.status || 'pending'}</span></td>
                        <td>${joined}</td>
                        <td>
                            <div class="action-icons">
                                <i class="fas fa-edit" onclick="openEditUserModal('${doc.id}')"></i>
                                <i class="fas fa-trash" onclick="openDeleteModal('user', '${doc.id}')"></i>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                html += `
                    <tr>
                        <td><div class="user-cell"><div class="user-avatar-sm">${(user.fullName || 'U').charAt(0)}</div> ${user.fullName || 'N/A'}</div></td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td><span class="badge badge-${user.status || 'pending'}">${user.status || 'pending'}</span></td>
                        <td>${joined}</td>
                        <td>
                            <div class="action-icons">
                                <i class="fas fa-edit" onclick="openEditUserModal('${doc.id}')"></i>
                                <i class="fas fa-trash" onclick="openDeleteModal('user', '${doc.id}')"></i>
                            </div>
                        </td>
                    </tr>
                `;
            }
        });
        
        tbody.innerHTML = html;
        initDataTable(`${tableId}Table`);
        
    } catch (error) {
        console.error('Error loading users by role:', error);
        tbody.innerHTML = `<tr><td colspan="6">Error loading ${role}s</td></tr>`;
    }
}

async function addUser() {
    const fullName = document.getElementById('newFullName').value;
    const email = document.getElementById('newEmail').value;
    const phone = document.getElementById('newPhone').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    const status = document.getElementById('newStatus').value;

    if (!fullName || !email || !password) {
        alert('Please fill all required fields');
        return;
    }

    try {
        const userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const uid = userCred.user.uid;

        await userCred.user.updateProfile({ displayName: fullName });

        const userData = {
            fullName,
            email,
            phone,
            role,
            status,
            emailVerified: false,
            permissions: role === 'super_admin' ? ['all'] : [],
            generatedId: generateId(role),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        };

        if (role === 'investor') {
            userData.investorData = {
                investmentRange: '',
                investmentHorizon: '',
                riskTolerance: 'moderate',
                accreditedInvestor: false
            };
        }

        await db.collection('users').doc(uid).set(userData);
        await logAudit('user_created', `Created user: ${email} (${role})`);

        alert('User created successfully');
        closeModal('addUserModal');
        
        // Clear form
        document.getElementById('addUserForm').reset();
        
        // Reload current section
        loadSection(currentSection);
        
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Error: ' + error.message);
    }
}

function openAddAdminModal() {
    document.getElementById('newRole').value = 'admin';
    openAddUserModal();
}

function openAddInvestorModal() {
    document.getElementById('newRole').value = 'investor';
    openAddUserModal();
}

function openAddClientModal() {
    document.getElementById('newRole').value = 'client';
    openAddUserModal();
}

function openAddUserModal() {
    document.getElementById('addUserForm').reset();
    openModal('addUserModal');
}

async function openEditUserModal(uid) {
    const user = allUsers.find(u => u.id === uid);
    if (!user) return;

    document.getElementById('editUserId').value = uid;
    document.getElementById('editFullName').value = user.fullName || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editRole').value = user.role || 'client';
    document.getElementById('editStatus').value = user.status || 'pending';

    openModal('editUserModal');
}

async function updateUser() {
    const uid = document.getElementById('editUserId').value;
    const fullName = document.getElementById('editFullName').value;
    const phone = document.getElementById('editPhone').value;
    const role = document.getElementById('editRole').value;
    const status = document.getElementById('editStatus').value;

    try {
        await db.collection('users').doc(uid).update({
            fullName,
            phone,
            role,
            status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.uid
        });

        await logAudit('user_updated', `Updated user: ${uid}`);

        alert('User updated successfully');
        closeModal('editUserModal');
        loadSection(currentSection);
        
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Error: ' + error.message);
    }
}

async function resetPassword(uid) {
    const user = allUsers.find(u => u.id === uid);
    if (!user || !user.email) return;

    if (!confirm(`Send password reset email to ${user.email}?`)) return;

    try {
        await firebase.auth().sendPasswordResetEmail(user.email);
        await logAudit('password_reset', `Password reset for: ${user.email}`);
        alert('Password reset email sent');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function toggleUserStatus(uid) {
    const user = allUsers.find(u => u.id === uid);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'suspend';

    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
        await db.collection('users').doc(uid).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await logAudit('status_changed', `User ${uid} status changed to ${newStatus}`);
        alert(`User ${newStatus}`);
        loadSection(currentSection);
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ============================================
// EVENT MANAGEMENT
// ============================================
async function loadEvents() {
    const tbody = document.getElementById('eventsTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading events...</td></tr>';
    
    try {
        const snapshot = await db.collection('events').orderBy('date', 'desc').get();
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6">No events found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const event = doc.data();
            html += `
                <tr>
                    <td>${event.title || 'N/A'}</td>
                    <td>${event.date || 'N/A'}</td>
                    <td>${event.location || 'N/A'}</td>
                    <td>${event.attendees || '0'}</td>
                    <td><span class="badge badge-${event.featured ? 'success' : 'info'}">${event.featured ? 'Featured' : 'Regular'}</span></td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-edit" onclick="editEvent('${doc.id}')" title="Edit"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('event', '${doc.id}')" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        initDataTable('eventsTable', { order: [[1, 'desc']] });
        
    } catch (error) {
        console.error('Error loading events:', error);
        tbody.innerHTML = '<tr><td colspan="6">Error loading events</td></tr>';
    }
}

function openAddEventModal() {
    document.getElementById('addEventForm').reset();
    openModal('addEventModal');
}

async function addEvent() {
    const title = document.getElementById('eventTitle').value;
    const description = document.getElementById('eventDescription').value;
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value;
    const featured = document.getElementById('eventFeatured').checked;

    if (!title || !date || !location) {
        alert('Please fill all required fields');
        return;
    }

    try {
        await db.collection('events').add({
            title,
            description,
            date,
            location,
            featured,
            attendees: '0',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        });

        await logAudit('event_created', `Created event: ${title}`);

        alert('Event created successfully');
        closeModal('addEventModal');
        loadEvents();
        
    } catch (error) {
        console.error('Error creating event:', error);
        alert('Error: ' + error.message);
    }
}

async function editEvent(id) {
    try {
        const eventDoc = await db.collection('events').doc(id).get();
        const event = eventDoc.data();
        
        document.getElementById('eventTitle').value = event.title || '';
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventDate').value = event.date || '';
        document.getElementById('eventLocation').value = event.location || '';
        document.getElementById('eventFeatured').checked = event.featured || false;
        
        window.currentEventId = id;
        openModal('addEventModal');
        
        const addBtn = document.querySelector('#addEventModal .btn-primary');
        addBtn.onclick = updateEvent;
        addBtn.innerHTML = '<i class="fas fa-save"></i> Update Event';
        
    } catch (error) {
        console.error('Error loading event:', error);
    }
}

async function updateEvent() {
    const id = window.currentEventId;
    const title = document.getElementById('eventTitle').value;
    const description = document.getElementById('eventDescription').value;
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value;
    const featured = document.getElementById('eventFeatured').checked;

    try {
        await db.collection('events').doc(id).update({
            title,
            description,
            date,
            location,
            featured,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await logAudit('event_updated', `Updated event: ${title}`);

        alert('Event updated successfully');
        closeModal('addEventModal');
        loadEvents();
        
        // Reset button
        const addBtn = document.querySelector('#addEventModal .btn-primary');
        addBtn.onclick = addEvent;
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Create Event';
        
    } catch (error) {
        console.error('Error updating event:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// TESTIMONIAL MANAGEMENT
// ============================================
async function loadTestimonials() {
    const tbody = document.getElementById('testimonialsTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading testimonials...</td></tr>';
    
    try {
        const snapshot = await db.collection('testimonials').get();
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6">No testimonials found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const testimonial = doc.data();
            html += `
                <tr>
                    <td>${testimonial.name || 'N/A'}</td>
                    <td>${testimonial.role || 'N/A'}</td>
                    <td>${testimonial.location || 'N/A'}</td>
                    <td>${'★'.repeat(testimonial.rating || 5)}</td>
                    <td>${(testimonial.text || '').substring(0, 50)}${(testimonial.text || '').length > 50 ? '...' : ''}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-edit" onclick="editTestimonial('${doc.id}')" title="Edit"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('testimonial', '${doc.id}')" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        initDataTable('testimonialsTable');
        
    } catch (error) {
        console.error('Error loading testimonials:', error);
        tbody.innerHTML = '<tr><td colspan="6">Error loading testimonials</td></tr>';
    }
}

function openAddTestimonialModal() {
    document.getElementById('addTestimonialForm').reset();
    openModal('addTestimonialModal');
}

async function addTestimonial() {
    const name = document.getElementById('testimonialName').value;
    const role = document.getElementById('testimonialRole').value;
    const location = document.getElementById('testimonialLocation').value;
    const text = document.getElementById('testimonialText').value;
    const rating = parseInt(document.getElementById('testimonialRating').value);

    if (!name || !text) {
        alert('Please fill required fields');
        return;
    }

    try {
        await db.collection('testimonials').add({
            name,
            role,
            location,
            text,
            rating,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await logAudit('testimonial_created', `Created testimonial for: ${name}`);

        alert('Testimonial added successfully');
        closeModal('addTestimonialModal');
        loadTestimonials();
        
    } catch (error) {
        console.error('Error adding testimonial:', error);
        alert('Error: ' + error.message);
    }
}

async function editTestimonial(id) {
    try {
        const testimonialDoc = await db.collection('testimonials').doc(id).get();
        const testimonial = testimonialDoc.data();
        
        document.getElementById('testimonialName').value = testimonial.name || '';
        document.getElementById('testimonialRole').value = testimonial.role || '';
        document.getElementById('testimonialLocation').value = testimonial.location || '';
        document.getElementById('testimonialText').value = testimonial.text || '';
        document.getElementById('testimonialRating').value = testimonial.rating || 5;
        
        window.currentTestimonialId = id;
        openModal('addTestimonialModal');
        
        const addBtn = document.querySelector('#addTestimonialModal .btn-primary');
        addBtn.onclick = updateTestimonial;
        addBtn.innerHTML = '<i class="fas fa-save"></i> Update Testimonial';
        
    } catch (error) {
        console.error('Error loading testimonial:', error);
    }
}

async function updateTestimonial() {
    const id = window.currentTestimonialId;
    const name = document.getElementById('testimonialName').value;
    const role = document.getElementById('testimonialRole').value;
    const location = document.getElementById('testimonialLocation').value;
    const text = document.getElementById('testimonialText').value;
    const rating = parseInt(document.getElementById('testimonialRating').value);

    try {
        await db.collection('testimonials').doc(id).update({
            name,
            role,
            location,
            text,
            rating,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await logAudit('testimonial_updated', `Updated testimonial for: ${name}`);

        alert('Testimonial updated successfully');
        closeModal('addTestimonialModal');
        loadTestimonials();
        
        const addBtn = document.querySelector('#addTestimonialModal .btn-primary');
        addBtn.onclick = addTestimonial;
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Testimonial';
        
    } catch (error) {
        console.error('Error updating testimonial:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// OPPORTUNITIES MANAGEMENT
// ============================================
async function loadOpportunities() {
    const tbody = document.getElementById('opportunitiesTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading opportunities...</td></tr>';
    
    try {
        const snapshot = await db.collection('opportunities').get();
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6">No opportunities found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const opp = doc.data();
            const created = opp.createdAt ? new Date(opp.createdAt.toDate()).toLocaleDateString() : 'N/A';
            html += `
                <tr>
                    <td>${opp.title || 'N/A'}</td>
                    <td>${(opp.description || '').substring(0, 50)}${(opp.description || '').length > 50 ? '...' : ''}</td>
                    <td>${opp.return || 'N/A'}</td>
                    <td><span class="badge badge-success">Active</span></td>
                    <td>${created}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-edit" onclick="editOpportunity('${doc.id}')" title="Edit"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('opportunity', '${doc.id}')" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        initDataTable('opportunitiesTable');
        
    } catch (error) {
        console.error('Error loading opportunities:', error);
        tbody.innerHTML = '<tr><td colspan="6">Error loading opportunities</td></tr>';
    }
}

function openAddOpportunityModal() {
    document.getElementById('addOpportunityForm').reset();
    openModal('addOpportunityModal');
}

async function addOpportunity() {
    const title = document.getElementById('opportunityTitle').value;
    const description = document.getElementById('opportunityDescription').value;
    const returnRate = document.getElementById('opportunityReturn').value;
    const icon = document.getElementById('opportunityIcon').value;

    if (!title || !description) {
        alert('Please fill required fields');
        return;
    }

    try {
        await db.collection('opportunities').add({
            title,
            description,
            return: returnRate,
            icon: icon || 'fas fa-chart-line',
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await logAudit('opportunity_created', `Created opportunity: ${title}`);

        alert('Opportunity added successfully');
        closeModal('addOpportunityModal');
        loadOpportunities();
        
    } catch (error) {
        console.error('Error adding opportunity:', error);
        alert('Error: ' + error.message);
    }
}

async function editOpportunity(id) {
    try {
        const oppDoc = await db.collection('opportunities').doc(id).get();
        const opp = oppDoc.data();
        
        document.getElementById('opportunityTitle').value = opp.title || '';
        document.getElementById('opportunityDescription').value = opp.description || '';
        document.getElementById('opportunityReturn').value = opp.return || '';
        document.getElementById('opportunityIcon').value = opp.icon || 'fas fa-chart-line';
        
        window.currentOpportunityId = id;
        openModal('addOpportunityModal');
        
        const addBtn = document.querySelector('#addOpportunityModal .btn-primary');
        addBtn.onclick = updateOpportunity;
        addBtn.innerHTML = '<i class="fas fa-save"></i> Update Opportunity';
        
    } catch (error) {
        console.error('Error loading opportunity:', error);
    }
}

async function updateOpportunity() {
    const id = window.currentOpportunityId;
    const title = document.getElementById('opportunityTitle').value;
    const description = document.getElementById('opportunityDescription').value;
    const returnRate = document.getElementById('opportunityReturn').value;
    const icon = document.getElementById('opportunityIcon').value;

    try {
        await db.collection('opportunities').doc(id).update({
            title,
            description,
            return: returnRate,
            icon,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await logAudit('opportunity_updated', `Updated opportunity: ${title}`);

        alert('Opportunity updated successfully');
        closeModal('addOpportunityModal');
        loadOpportunities();
        
        const addBtn = document.querySelector('#addOpportunityModal .btn-primary');
        addBtn.onclick = addOpportunity;
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Opportunity';
        
    } catch (error) {
        console.error('Error updating opportunity:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// ANNOUNCEMENTS MANAGEMENT
// ============================================
async function loadAnnouncements() {
    const tbody = document.getElementById('announcementsTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading announcements...</td></tr>';
    
    try {
        const snapshot = await db.collection('announcements').orderBy('createdAt', 'desc').get();
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6">No announcements found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const ann = doc.data();
            const created = ann.createdAt ? new Date(ann.createdAt.toDate()).toLocaleDateString() : 'N/A';
            html += `
                <tr>
                    <td>${ann.title || 'N/A'}</td>
                    <td>${(ann.content || '').substring(0, 50)}${(ann.content || '').length > 50 ? '...' : ''}</td>
                    <td>${ann.link || 'N/A'}</td>
                    <td><span class="badge badge-${ann.active ? 'success' : 'warning'}">${ann.active ? 'Active' : 'Inactive'}</span></td>
                    <td>${created}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-edit" onclick="editAnnouncement('${doc.id}')" title="Edit"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('announcement', '${doc.id}')" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        initDataTable('announcementsTable', { order: [[4, 'desc']] });
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        tbody.innerHTML = '<tr><td colspan="6">Error loading announcements</td></tr>';
    }
}

function openAddAnnouncementModal() {
    document.getElementById('addAnnouncementForm').reset();
    openModal('addAnnouncementModal');
}

async function addAnnouncement() {
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const link = document.getElementById('announcementLink').value;
    const active = document.getElementById('announcementActive').checked;

    if (!title || !content) {
        alert('Please fill required fields');
        return;
    }

    try {
        await db.collection('announcements').add({
            title,
            content,
            link: link || '#',
            active,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await logAudit('announcement_created', `Created announcement: ${title}`);

        alert('Announcement added successfully');
        closeModal('addAnnouncementModal');
        loadAnnouncements();
        
    } catch (error) {
        console.error('Error adding announcement:', error);
        alert('Error: ' + error.message);
    }
}

async function editAnnouncement(id) {
    try {
        const annDoc = await db.collection('announcements').doc(id).get();
        const ann = annDoc.data();
        
        document.getElementById('announcementTitle').value = ann.title || '';
        document.getElementById('announcementContent').value = ann.content || '';
        document.getElementById('announcementLink').value = ann.link || '';
        document.getElementById('announcementActive').checked = ann.active || false;
        
        window.currentAnnouncementId = id;
        openModal('addAnnouncementModal');
        
        const addBtn = document.querySelector('#addAnnouncementModal .btn-primary');
        addBtn.onclick = updateAnnouncement;
        addBtn.innerHTML = '<i class="fas fa-save"></i> Update Announcement';
        
    } catch (error) {
        console.error('Error loading announcement:', error);
    }
}

async function updateAnnouncement() {
    const id = window.currentAnnouncementId;
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const link = document.getElementById('announcementLink').value;
    const active = document.getElementById('announcementActive').checked;

    try {
        await db.collection('announcements').doc(id).update({
            title,
            content,
            link,
            active,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await logAudit('announcement_updated', `Updated announcement: ${title}`);

        alert('Announcement updated successfully');
        closeModal('addAnnouncementModal');
        loadAnnouncements();
        
        const addBtn = document.querySelector('#addAnnouncementModal .btn-primary');
        addBtn.onclick = addAnnouncement;
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Announcement';
        
    } catch (error) {
        console.error('Error updating announcement:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// PROFILE MANAGEMENT
// ============================================
function loadProfile() {
    // Already loaded from auth state
}

async function updateProfile() {
    const fullName = document.getElementById('profileFullName').value;
    const phone = document.getElementById('profilePhone').value;
    const currentPassword = document.getElementById('profileCurrentPassword').value;
    const newPassword = document.getElementById('profileNewPassword').value;
    const confirmPassword = document.getElementById('profileConfirmPassword').value;

    try {
        // Update Firestore
        await db.collection('users').doc(currentUser.uid).update({
            fullName,
            phone,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update Auth profile
        await currentUser.updateProfile({ displayName: fullName });

        // Change password if requested
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            
            await currentUser.reauthenticateWithCredential(credential);
            await currentUser.updatePassword(newPassword);
        }

        await logAudit('profile_updated', 'Updated own profile');

        alert('Profile updated successfully');
        
        // Clear password fields
        document.getElementById('profileCurrentPassword').value = '';
        document.getElementById('profileNewPassword').value = '';
        document.getElementById('profileConfirmPassword').value = '';
        
        // Update UI
        document.getElementById('userName').textContent = fullName;
        document.getElementById('userAvatar').textContent = fullName.charAt(0);
        document.getElementById('profileAvatar').textContent = fullName.charAt(0);
        document.getElementById('profileName').textContent = fullName;
        
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================
async function loadSettings() {
    try {
        const settingsDoc = await db.collection('settings').doc('site').get();
        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            document.getElementById('siteName').value = settings.siteName || 'TAAGC Global';
            document.getElementById('supportEmail').value = settings.supportEmail || 'support@taagc.website';
            document.getElementById('supportPhone').value = settings.supportPhone || '+1 (800) 123-4567';
            document.getElementById('maintenanceMode').checked = settings.maintenanceMode || false;
            document.getElementById('registrationEnabled').checked = settings.registrationEnabled !== false;
            document.getElementById('emailVerificationRequired').checked = settings.emailVerificationRequired !== false;
            document.getElementById('sessionTimeout').value = settings.sessionTimeout || 30;
            document.getElementById('maxLoginAttempts').value = settings.maxLoginAttempts || 5;
            document.getElementById('twoFactorAuth').checked = settings.twoFactorAuth || false;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    const settings = {
        siteName: document.getElementById('siteName').value,
        supportEmail: document.getElementById('supportEmail').value,
        supportPhone: document.getElementById('supportPhone').value,
        maintenanceMode: document.getElementById('maintenanceMode').checked,
        registrationEnabled: document.getElementById('registrationEnabled').checked,
        emailVerificationRequired: document.getElementById('emailVerificationRequired').checked,
        sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
        maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value),
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: currentUser.uid
    };

    try {
        await db.collection('settings').doc('site').set(settings, { merge: true });
        await logAudit('settings_updated', 'System settings updated');
        alert('Settings saved successfully');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// AUDIT LOGS
// ============================================
async function loadAuditLogs() {
    const tbody = document.getElementById('auditTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading audit logs...</td></tr>';
    
    try {
        const snapshot = await db.collection('audit')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5">No logs found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const log = doc.data();
            const time = log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : 'N/A';
            
            html += `
                <tr>
                    <td>${time}</td>
                    <td>${log.user || 'System'}</td>
                    <td><span class="badge badge-info">${log.action || 'N/A'}</span></td>
                    <td>${log.details || 'N/A'}</td>
                    <td>${log.ip || 'N/A'}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        initDataTable('auditTable', {
            pageLength: 50,
            order: [[0, 'desc']]
        });
        
    } catch (error) {
        console.error('Error loading audit logs:', error);
        tbody.innerHTML = '<tr><td colspan="5">Error loading logs</td></tr>';
    }
}

async function logAudit(action, details) {
    try {
        await db.collection('audit').add({
            action,
            details,
            user: currentUser?.email || 'system',
            userId: currentUser?.uid || 'system',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ip: 'admin-panel'
        });
    } catch (error) {
        console.error('Error logging audit:', error);
    }
}

function exportAuditLogs() {
    if (!dataTables.auditTable) {
        alert('No data to export');
        return;
    }
    
    const data = dataTables.auditTable.rows().data().toArray();
    const csv = convertToCSV(data.map(row => ({
        Timestamp: row[0],
        User: row[1],
        Action: row[2].replace(/<[^>]*>/g, ''),
        Details: row[3],
        IP: row[4]
    })));
    
    downloadFile('audit_logs.csv', csv);
}

async function clearAuditLogs() {
    if (!confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) return;
    
    try {
        const snapshot = await db.collection('audit').get();
        if (snapshot.empty) {
            alert('No logs to clear');
            return;
        }
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        await logAudit('audit_cleared', 'Cleared all audit logs');
        alert('Audit logs cleared');
        loadAuditLogs();
        
    } catch (error) {
        console.error('Error clearing audit logs:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// BACKUP FUNCTIONS
// ============================================
async function loadBackupInfo() {
    const tbody = document.getElementById('backupsTableBody');
    
    try {
        const snapshot = await db.collection('backups').orderBy('createdAt', 'desc').get();
        
        if (!snapshot.empty) {
            const lastBackup = snapshot.docs[0].data();
            document.getElementById('lastBackup').textContent = 
                lastBackup.createdAt ? new Date(lastBackup.createdAt.toDate()).toLocaleString() : 'Never';
            document.getElementById('backupSize').textContent = lastBackup.size || '0 MB';
        }
        
        document.getElementById('totalBackups').textContent = snapshot.size;
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4">No backups found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const backup = doc.data();
            const date = backup.createdAt ? new Date(backup.createdAt.toDate()).toLocaleString() : 'N/A';
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${backup.size || '0 MB'}</td>
                    <td>${backup.createdBy || 'System'}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-download" onclick="downloadBackup('${doc.id}')" title="Download"></i>
                            <i class="fas fa-undo" onclick="openRestoreModal('${doc.id}')" title="Restore"></i>
                            <i class="fas fa-trash" onclick="deleteBackup('${doc.id}')" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
        // Populate restore select
        const restoreSelect = document.getElementById('restoreBackupSelect');
        if (restoreSelect) {
            restoreSelect.innerHTML = '';
            snapshot.forEach(doc => {
                const backup = doc.data();
                const date = backup.createdAt ? new Date(backup.createdAt.toDate()).toLocaleString() : 'N/A';
                restoreSelect.innerHTML += `<option value="${doc.id}">${date} - ${backup.size}</option>`;
            });
        }
        
    } catch (error) {
        console.error('Error loading backup info:', error);
    }
}

async function createBackup() {
    if (!confirm('Create a new backup? This may take a few moments.')) return;
    
    try {
        // Get all collections
        const collections = ['users', 'events', 'testimonials', 'opportunities', 'announcements', 'settings'];
        const backup = {};
        let totalSize = 0;
        
        for (const collection of collections) {
            const snapshot = await db.collection(collection).get();
            backup[collection] = snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            }));
        }
        
        // Calculate size
        const backupStr = JSON.stringify(backup);
        const sizeKB = Math.round(backupStr.length / 1024);
        const sizeMB = (sizeKB / 1024).toFixed(2);
        
        // Save backup
        await db.collection('backups').add({
            data: backup,
            size: sizeMB + ' MB',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.email,
            collections: collections
        });
        
        await logAudit('backup_created', `Database backup created (${sizeMB} MB)`);
        
        alert('Backup created successfully');
        loadBackupInfo();
        
    } catch (error) {
        console.error('Error creating backup:', error);
        alert('Error: ' + error.message);
    }
}

async function downloadBackup(id) {
    try {
        const backupDoc = await db.collection('backups').doc(id).get();
        const backup = backupDoc.data();
        
        const dataStr = JSON.stringify(backup.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date(backup.createdAt.toDate()).toISOString()}.json`;
        a.click();
        
    } catch (error) {
        console.error('Error downloading backup:', error);
        alert('Error: ' + error.message);
    }
}

function downloadLatestBackup() {
    const firstRow = document.querySelector('#backupsTableBody tr:first-child');
    if (firstRow) {
        const downloadBtn = firstRow.querySelector('.fa-download');
        if (downloadBtn) {
            downloadBtn.click();
        }
    }
}

function openRestoreModal(id) {
    window.restoreBackupId = id;
    openModal('restoreModal');
}

async function restoreBackup() {
    const id = window.restoreBackupId || document.getElementById('restoreBackupSelect').value;
    if (!id) return;
    
    if (!confirm('WARNING: This will overwrite current data. Are you absolutely sure?')) return;
    
    try {
        const backupDoc = await db.collection('backups').doc(id).get();
        const backup = backupDoc.data();
        
        // Restore each collection
        for (const [collection, docs] of Object.entries(backup.data)) {
            const batch = db.batch();
            
            // Delete existing documents
            const existingSnapshot = await db.collection(collection).get();
            existingSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // Add backup documents
            docs.forEach(item => {
                const ref = db.collection(collection).doc(item.id);
                batch.set(ref, item.data);
            });
            
            await batch.commit();
        }
        
        await logAudit('backup_restored', `Database restored from backup ${id}`);
        
        alert('Backup restored successfully');
        closeModal('restoreModal');
        
        // Reload current section
        loadSection(currentSection);
        
    } catch (error) {
        console.error('Error restoring backup:', error);
        alert('Error: ' + error.message);
    }
}

async function deleteBackup(id) {
    if (!confirm('Delete this backup?')) return;
    
    try {
        await db.collection('backups').doc(id).delete();
        await logAudit('backup_deleted', `Deleted backup ${id}`);
        alert('Backup deleted');
        loadBackupInfo();
        
    } catch (error) {
        console.error('Error deleting backup:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// NOTIFICATIONS
// ============================================
async function loadNotifications() {
    try {
        const snapshot = await db.collection('notifications')
            .where('read', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        document.getElementById('notificationCount').textContent = snapshot.size;
        
        if (snapshot.empty) {
            document.getElementById('notificationsList').innerHTML = '<div class="notification-item">No new notifications</div>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const notif = doc.data();
            const time = notif.createdAt ? new Date(notif.createdAt.toDate()).toLocaleString() : 'N/A';
            html += `
                <div class="notification-item unread" onclick="markNotificationRead('${doc.id}')">
                    <strong>${notif.title || 'Notification'}</strong>
                    <p>${notif.message || ''}</p>
                    <small>${time}</small>
                </div>
            `;
        });
        
        document.getElementById('notificationsList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function markNotificationRead(id) {
    try {
        await db.collection('notifications').doc(id).update({
            read: true
        });
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification read:', error);
    }
}

async function markAllNotificationsRead() {
    try {
        const snapshot = await db.collection('notifications')
            .where('read', '==', false)
            .get();
        
        if (snapshot.empty) return;
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();
        
        loadNotifications();
        
    } catch (error) {
        console.error('Error marking all notifications read:', error);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function generateId(role) {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const prefixes = {
        super_admin: 'SA',
        admin: 'AD',
        investor: 'IN',
        client: 'CL'
    };
    
    const prefix = prefixes[role] || 'US';
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${prefix}${random}/${day}${month}${year}`;
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    
    return [headers, ...rows].join('\n');
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function exportUsers() {
    if (!dataTables.usersTable) {
        alert('No data to export');
        return;
    }
    
    const data = dataTables.usersTable.rows().data().toArray();
    const csv = convertToCSV(data.map(row => ({
        Name: row[0].replace(/<[^>]*>/g, '').trim(),
        Email: row[1],
        Phone: row[2],
        Role: row[3].replace(/<[^>]*>/g, ''),
        Status: row[4].replace(/<[^>]*>/g, ''),
        Verified: row[5].replace(/<[^>]*>/g, ''),
        Joined: row[6]
    })));
    
    downloadFile('users_export.csv', csv);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    
    // Reset modal buttons
    if (modalId === 'addEventModal') {
        const addBtn = document.querySelector('#addEventModal .btn-primary');
        if (addBtn) {
            addBtn.onclick = addEvent;
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Create Event';
        }
    } else if (modalId === 'addTestimonialModal') {
        const addBtn = document.querySelector('#addTestimonialModal .btn-primary');
        if (addBtn) {
            addBtn.onclick = addTestimonial;
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Testimonial';
        }
    } else if (modalId === 'addOpportunityModal') {
        const addBtn = document.querySelector('#addOpportunityModal .btn-primary');
        if (addBtn) {
            addBtn.onclick = addOpportunity;
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Opportunity';
        }
    } else if (modalId === 'addAnnouncementModal') {
        const addBtn = document.querySelector('#addAnnouncementModal .btn-primary');
        if (addBtn) {
            addBtn.onclick = addAnnouncement;
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Announcement';
        }
    }
}

function openDeleteModal(type, id) {
    deleteCallback = () => deleteItem(type, id);
    document.getElementById('deleteMessage').textContent = `Are you sure you want to delete this ${type}?`;
    openModal('deleteModal');
}

async function confirmDelete() {
    if (deleteCallback) {
        await deleteCallback();
        deleteCallback = null;
        closeModal('deleteModal');
    }
}

async function deleteItem(type, id) {
    try {
        const collection = type === 'user' ? 'users' : 
                          type === 'event' ? 'events' :
                          type === 'testimonial' ? 'testimonials' :
                          type === 'opportunity' ? 'opportunities' :
                          type + 's';
        
        await db.collection(collection).doc(id).delete();
        await logAudit(`${type}_deleted`, `Deleted ${type}: ${id}`);
        alert(`${type} deleted successfully`);
        
        // Refresh current section
        loadSection(currentSection);
        
    } catch (error) {
        console.error('Error deleting:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// UI EVENT HANDLERS
// ============================================
document.getElementById('notificationsBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notificationsPanel').classList.toggle('show');
});

document.getElementById('userMenuBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userMenu').classList.toggle('show');
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('.notifications') && !e.target.closest('.notifications-panel')) {
        document.getElementById('notificationsPanel')?.classList.remove('show');
    }
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userMenu')?.classList.remove('show');
    }
});

// Prevent multiple DataTable initializations
$(document).ready(function() {
    // Ensure DataTables are only initialized when needed
    console.log('Admin dashboard ready');
});

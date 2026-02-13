// admin/js/admin-dashboard.js
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from './firebase-init.js';
import { PageManager } from './admin-pages.js';
import { UserManager } from './admin-users.js';
import { AnalyticsManager } from './admin-analytics.js';

const auth = getAuth(app);
const db = getFirestore(app);

// Global admin state
let currentAdmin = null;

// Initialize dashboard
export async function initDashboard() {
    const adminData = sessionStorage.getItem('taagc_admin');
    if (!adminData) {
        window.location.href = '/admin/';
        return;
    }
    
    currentAdmin = JSON.parse(adminData);
    
    // Set admin info
    document.getElementById('adminName').innerHTML = currentAdmin.name || 'Ahmad Hamza';
    document.getElementById('adminRole').innerHTML = currentAdmin.roleName || 'Super Administrator';
    
    const initials = (currentAdmin.name || 'AH').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    document.getElementById('adminInitials').innerHTML = initials;
    
    // Setup navigation
    setupNavigation();
    
    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Load default section
    await loadSection('dashboard');
}

// Setup navigation click handlers
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', async function(e) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.dataset.section;
            await loadSection(section);
        });
    });
}

// Load section content
async function loadSection(section) {
    const content = document.getElementById('mainContent');
    
    switch(section) {
        case 'dashboard':
            content.innerHTML = await getDashboardHTML();
            break;
        case 'pages':
            content.innerHTML = await PageManager.getPagesHTML();
            break;
        case 'users':
            content.innerHTML = await UserManager.getUsersHTML();
            break;
        case 'admins':
            content.innerHTML = await getAdminsHTML();
            break;
        case 'analytics':
            content.innerHTML = await AnalyticsManager.getAnalyticsHTML();
            break;
        case 'settings':
            content.innerHTML = getSettingsHTML();
            break;
    }
}

// Dashboard HTML
async function getDashboardHTML() {
    const pagesSnap = await getDocs(collection(db, "pages"));
    const usersSnap = await getDocs(collection(db, "users"));
    const adminsSnap = await getDocs(collection(db, "admins"));
    
    return `
        <div class="header">
            <h1 style="color:#0a2540;">Dashboard</h1>
            <div style="color:#64748b;">${new Date().toLocaleDateString()}</div>
        </div>
        
        <div style="background:linear-gradient(135deg,#0a2540,#2d5a4a); color:white; padding:30px; border-radius:16px; margin-bottom:30px;">
            <h2 style="margin-bottom:10px;">Welcome, ${currentAdmin.name?.split(' ')[0] || 'Admin'}!</h2>
            <p style="opacity:0.9;">You are logged in as ${currentAdmin.roleName || 'Super Administrator'} with full system access.</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
                <div class="stat-number">${pagesSnap.size || 0}</div>
                <div class="stat-label">Total Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-number">${usersSnap.size || 0}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-user-shield"></i></div>
                <div class="stat-number">${adminsSnap.size || 1}</div>
                <div class="stat-label">Administrators</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-number">Active</div>
                <div class="stat-label">System Status</div>
            </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div class="section-card">
                <h3 style="color:#0a2540; margin-bottom:16px;">Quick Actions</h3>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button class="btn" onclick="window.pageEditor?.openModal()">
                        <i class="fas fa-plus"></i> Create New Page
                    </button>
                    <button class="btn btn-outline" onclick="window.location.href='/setup-admin.html'">
                        <i class="fas fa-user-plus"></i> Add Administrator
                    </button>
                </div>
            </div>
            <div class="section-card">
                <h3 style="color:#0a2540; margin-bottom:16px;">System Info</h3>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div><strong>Admin:</strong> ${currentAdmin.name || 'Ahmad Hamza'}</div>
                    <div><strong>Email:</strong> ${currentAdmin.email || 'priahmz@gmail.com'}</div>
                    <div><strong>Role:</strong> ${currentAdmin.roleName || 'Super Administrator'}</div>
                </div>
            </div>
        </div>
    `;
}

// Admins HTML
async function getAdminsHTML() {
    const adminsSnap = await getDocs(collection(db, "admins"));
    
    let rows = '';
    adminsSnap.forEach(doc => {
        const admin = doc.data();
        rows += `
            <tr>
                <td><strong>${admin.name || 'N/A'}</strong></td>
                <td>${admin.email || 'N/A'}</td>
                <td>${admin.roleName || admin.role || 'Administrator'}</td>
                <td><span class="status-badge status-active">Active</span></td>
                <td>${admin.createdAt ? new Date(admin.createdAt.toDate?.() || admin.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm" onclick="alert('Edit admin coming soon')">Edit</button>
                    ${doc.id !== currentAdmin?.uid ? 
                        `<button class="btn btn-sm btn-outline" onclick="deleteAdmin('${doc.id}')">Delete</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    return `
        <div class="header">
            <h1 style="color:#0a2540;">Administrators</h1>
            <button class="btn" onclick="window.location.href='/setup-admin.html'">
                <i class="fas fa-plus"></i> Add Admin
            </button>
        </div>
        
        <div class="section-card">
            <h2 style="color:#0a2540; margin-bottom:20px;">Admin Users</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="6" style="text-align:center; padding:40px;">No admins found.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

// Settings HTML
function getSettingsHTML() {
    return `
        <div class="header">
            <h1 style="color:#0a2540;">Settings</h1>
        </div>
        
        <div class="section-card">
            <h2 style="color:#0a2540; margin-bottom:20px;">Admin Profile</h2>
            
            <div style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:8px; font-weight:600;">Name</label>
                <input type="text" class="form-control" value="${currentAdmin?.name || 'Ahmad Hamza'}" readonly>
            </div>
            
            <div style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:8px; font-weight:600;">Email</label>
                <input type="email" class="form-control" value="${currentAdmin?.email || 'priahmz@gmail.com'}" readonly>
            </div>
            
            <div style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:8px; font-weight:600;">Role</label>
                <input type="text" class="form-control" value="${currentAdmin?.roleName || 'Super Administrator'}" readonly>
            </div>
        </div>
        
        <div class="section-card">
            <h2 style="color:#0a2540; margin-bottom:20px;">Security</h2>
            
            <button class="btn btn-outline" style="margin-right:10px;" onclick="window.location.href='/setup-admin.html'">
                <i class="fas fa-user-plus"></i> Create New Admin
            </button>
            
            <button class="btn btn-danger" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;
}

// Delete admin
window.deleteAdmin = async function(adminId) {
    if (confirm('Are you sure you want to remove this administrator?')) {
        const { deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        try {
            await deleteDoc(doc(db, "admins", adminId));
            alert('Administrator removed successfully!');
            await loadSection('admins');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
};

// Logout
export async function logout() {
    await signOut(auth);
    sessionStorage.removeItem('taagc_admin');
    window.location.href = '/admin/';
}
window.logout = logout;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);

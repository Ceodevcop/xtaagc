// admin/js/admin-core.js
import { auth, db } from './firebase-init.js';
import { Notifications } from './components/notifications.js';
import { Modal } from './components/modal.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class AdminCore {
    constructor() {
        this.currentAdmin = null;
        this.currentPage = 'dashboard';
        this.pageModules = {};
        this.init();
    }
    
    async init() {
        // Check authentication
        const adminData = sessionStorage.getItem('taagc_admin');
        if (!adminData) {
            window.location.href = '/admin/';
            return;
        }
        
        this.currentAdmin = JSON.parse(adminData);
        
        // Set admin info in sidebar
        document.getElementById('adminName').innerHTML = this.currentAdmin.name || 'Ahmad Hamza';
        document.getElementById('adminRole').innerHTML = this.currentAdmin.roleName || 'Super Administrator';
        
        const initials = (this.currentAdmin.name || 'AH').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        document.getElementById('adminInitials').innerHTML = initials;
        
        // Load all page modules
        await this.loadPageModules();
        
        // Setup navigation
        this.setupNavigation();
        
        // Setup logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Load initial page
        await this.loadPage('dashboard');
        
        Notifications.success(`Welcome back, ${this.currentAdmin.name || 'Admin'}!`);
    }
    
    async loadPageModules() {
        const pages = [
            'dashboard', 'pages', 'users', 'admins', 'companies',
            'orders', 'investments', 'support', 'analytics', 'settings'
        ];
        
        for (const page of pages) {
            try {
                this.pageModules[page] = await import(`./pages/${page}-page.js`);
            } catch (e) {
                console.warn(`Page module ${page} not loaded:`, e);
            }
        }
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                await this.loadPage(page);
            });
        });
    }
    
    async loadPage(pageName) {
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelector(`.nav-item[data-page="${pageName}"]`)?.classList.add('active');
        
        this.currentPage = pageName;
        
        const content = document.getElementById('mainContent');
        content.innerHTML = '<div class="loading-screen"><div class="loading"></div></div>';
        
        try {
            const module = this.pageModules[pageName];
            if (module && module.render) {
                const html = await module.render(this.currentAdmin);
                content.innerHTML = html;
                
                if (module.init) {
                    setTimeout(() => module.init(this.currentAdmin), 50);
                }
            } else {
                content.innerHTML = '<div class="empty-state"><i class="fas fa-code-branch"></i><h3>Coming Soon</h3><p>This page is under development.</p></div>';
            }
        } catch (error) {
            console.error('Error loading page:', error);
            content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i><h3>Error Loading Page</h3><p>${error.message}</p></div>`;
        }
    }
    
    async logout() {
        await signOut(auth);
        sessionStorage.removeItem('taagc_admin');
        Notifications.success('Logged out successfully');
        setTimeout(() => window.location.href = '/admin/', 1000);
    }
    
    static async getStats() {
        const pages = await getDocs(collection(db, "pages"));
        const users = await getDocs(collection(db, "users"));
        const admins = await getDocs(collection(db, "admins"));
        const companies = await getDocs(collection(db, "companies"));
        const orders = await getDocs(collection(db, "orders"));
        const investments = await getDocs(collection(db, "investments"));
        
        return {
            pages: pages.size,
            users: users.size,
            admins: admins.size,
            companies: companies.size,
            orders: orders.size,
            investments: investments.size
        };
    }
}

// Initialize core
document.addEventListener('DOMContentLoaded', () => {
    window.adminCore = new AdminCore();
});

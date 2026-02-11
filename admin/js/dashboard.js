// admin/js/dashboard.js
import { db } from '../../firebase-config.js';
import { authManager } from './auth.js';
import { Utils } from './utils.js';
import { 
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class Dashboard {
    constructor() {
        this.pages = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPages();
        this.updateUserInfo();
    }

    bindEvents() {
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            try {
                await authManager.logout();
                Utils.showToast('Logged out successfully', 'success');
            } catch (error) {
                Utils.showToast('Logout failed: ' + error.message, 'error');
            }
        });

        // Create Page
        document.getElementById('createPageBtn').addEventListener('click', () => this.createPage());

        // Navigation
        document.getElementById('navPages').addEventListener('click', (e) => {
            e.preventDefault();
            // Already on pages
        });

        document.getElementById('navOrders').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('orders');
        });

        document.getElementById('navInvestments').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('investments');
        });

        document.getElementById('navUsers').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('users');
        });

        document.getElementById('navSettings').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('settings');
        });
    }

    updateUserInfo() {
        const user = authManager.getCurrentUser();
        if (user) {
            document.getElementById('userEmail').textContent = user.email;
        }
    }

    async loadPages() {
        try {
            const q = query(collection(db, 'pages'), orderBy('updatedAt', 'desc'));
            
            onSnapshot(q, (snapshot) => {
                this.pages = [];
                let total = 0;
                let published = 0;
                let drafts = 0;
                let latestDate = null;
                
                const tableBody = document.getElementById('pagesTableBody');
                tableBody.innerHTML = '';
                
                if (snapshot.empty) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="empty-state">
                                No pages found. Create your first page!
                            </td>
                        </tr>
                    `;
                    this.updateStats(0, 0, 0, null);
                    return;
                }
                
                snapshot.forEach((docSnap) => {
                    total++;
                    const page = { 
                        id: docSnap.id, 
                        ...docSnap.data(),
                        slug: docSnap.data().slug || 'untitled'
                    };
                    
                    this.pages.push(page);
                    
                    if (page.status === 'published') published++;
                    if (page.status === 'draft') drafts++;
                    
                    if (!latestDate || (page.updatedAt && page.updatedAt > latestDate)) {
                        latestDate = page.updatedAt;
                    }
                    
                    const row = this.createPageRow(page);
                    tableBody.appendChild(row);
                });
                
                this.updateStats(total, published, drafts, latestDate);
            });
            
        } catch (error) {
            console.error('Error loading pages:', error);
            document.getElementById('pagesTableBody').innerHTML = `
                <tr>
                    <td colspan="5" class="error">
                        Error loading pages: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    createPageRow(page) {
        const row = document.createElement('tr');
        
        const updatedDate = page.updatedAt ? Utils.formatDate(page.updatedAt) : 'N/A';
        
        row.innerHTML = `
            <td>${page.title || 'Untitled'}</td>
            <td>/${page.slug}</td>
            <td>
                <span class="status-badge status-${page.status || 'draft'}">
                    ${page.status || 'draft'}
                </span>
            </td>
            <td>${updatedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-id="${page.id}">
                        Edit
                    </button>
                    <button class="btn-preview" data-slug="${page.slug}">
                        Preview
                    </button>
                    <button class="btn-delete" data-id="${page.id}" data-slug="${page.slug}">
                        Delete
                    </button>
                </div>
            </td>
        `;
        
        // Add event listeners
        row.querySelector('.btn-edit').addEventListener('click', (e) => {
            this.editPage(e.target.dataset.id);
        });
        
        row.querySelector('.btn-preview').addEventListener('click', (e) => {
            this.previewPage(e.target.dataset.slug);
        });
        
        row.querySelector('.btn-delete').addEventListener('click', (e) => {
            this.deletePage(e.target.dataset.id, e.target.dataset.slug);
        });
        
        return row;
    }

    async createPage() {
        try {
            const pageName = prompt('Enter page title:');
            if (!pageName) return;

            const slug = Utils.generateSlug(pageName);
            
            const newPage = {
                title: pageName,
                slug: slug,
                status: 'draft',
                sections: [],
                meta: {
                    description: '',
                    keywords: ''
                },
                settings: {
                    showInNav: true,
                    template: 'default'
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                order: this.pages.length
            };

            await addDoc(collection(db, 'pages'), newPage);
            Utils.showToast('Page created successfully!', 'success');
        } catch (error) {
            console.error('Error creating page:', error);
            Utils.showToast('Error creating page: ' + error.message, 'error');
        }
    }

    editPage(pageId) {
        window.location.href = `editor.html?id=${pageId}`;
    }

    previewPage(slug) {
        window.open(`https://taagc.website/${slug}`, '_blank');
    }

    async deletePage(pageId, pageSlug) {
        const protectedSlugs = ['home', 'contact', 'services'];
        if (protectedSlugs.includes(pageSlug)) {
            Utils.showToast('Cannot delete essential pages (home, contact, services)', 'error');
            return;
        }
        
        const confirmed = await Utils.confirmAction('Are you sure you want to delete this page? This action cannot be undone.');
        
        if (confirmed) {
            try {
                await deleteDoc(doc(db, 'pages', pageId));
                Utils.showToast('Page deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting page:', error);
                Utils.showToast('Error deleting page: ' + error.message, 'error');
            }
        }
    }

    updateStats(total, published, drafts, latestDate) {
        document.getElementById('totalPages').textContent = total;
        document.getElementById('publishedPages').textContent = published;
        document.getElementById('draftPages').textContent = drafts;
        
        if (latestDate) {
            document.getElementById('lastUpdated').textContent = Utils.formatDateShort(latestDate);
        } else {
            document.getElementById('lastUpdated').textContent = '-';
        }
    }

    showSection(section) {
        Utils.showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} section coming soon!`, 'info');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});

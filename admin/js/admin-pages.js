// admin/js/admin-pages.js
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from './firebase-init.js';

const db = getFirestore(app);

export const PageManager = {
    // Get all pages HTML
    async getPagesHTML() {
        const pagesSnap = await getDocs(query(collection(db, "pages"), orderBy("createdAt", "desc")));
        
        let rows = '';
        pagesSnap.forEach(doc => {
            const page = doc.data();
            rows += `
                <tr>
                    <td><strong>${page.title || 'Untitled'}</strong></td>
                    <td>/${page.slug || doc.id}</td>
                    <td><span class="status-badge ${page.status === 'published' ? 'status-active' : 'status-draft'}">${page.status || 'draft'}</span></td>
                    <td>${page.createdAt ? new Date(page.createdAt.toDate?.() || page.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm" onclick="window.pageEditor?.editPage('${doc.id}')" style="margin-right:5px;">Edit</button>
                        <button class="btn btn-sm btn-outline" onclick="window.pageEditor?.deletePage('${doc.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        return `
            <div class="header">
                <h1 style="color:#0a2540;">Page Creator</h1>
                <button class="btn" onclick="window.pageEditor?.openModal()">
                    <i class="fas fa-plus"></i> Create New Page
                </button>
            </div>
            
            <div class="section-card">
                <h2 style="color:#0a2540; margin-bottom:20px;">All Pages</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>URL</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="5" style="text-align:center; padding:40px;">No pages found. Create your first page!</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Create new page
    async createPage(pageData) {
        const adminData = JSON.parse(sessionStorage.getItem('taagc_admin') || '{}');
        
        const data = {
            ...pageData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: adminData?.uid || 'admin',
            createdByName: adminData?.name || 'Admin',
            status: pageData.publish ? 'published' : 'draft'
        };
        
        await setDoc(doc(db, "pages", pageData.slug), data);
        return { success: true };
    },

    // Delete page
    async deletePage(pageId) {
        await deleteDoc(doc(db, "pages", pageId));
        return { success: true };
    }
};

// Page Editor UI Controller
export class PageEditor {
    constructor() {
        this.modal = document.getElementById('pageEditorModal');
        this.form = document.getElementById('pageCreateForm');
        this.setupListeners();
    }

    setupListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createPage();
        });
    }

    openModal() {
        this.modal.classList.add('active');
        document.getElementById('pageTitle').focus();
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.form.reset();
    }

    async createPage() {
        const btn = document.getElementById('createPageBtn');
        btn.innerHTML = '<span class="loading"></span> Creating...';
        btn.disabled = true;

        const pageData = {
            title: document.getElementById('pageTitle').value,
            slug: document.getElementById('pageSlug').value,
            template: document.getElementById('pageTemplate').value,
            publish: document.getElementById('pagePublish').checked,
            sections: []
        };

        try {
            await PageManager.createPage(pageData);
            alert('Page created successfully!');
            this.closeModal();
            
            // Refresh pages view
            const content = document.getElementById('mainContent');
            content.innerHTML = await PageManager.getPagesHTML();
            
        } catch (error) {
            alert('Error: ' + error.message);
        }

        btn.innerHTML = 'Create Page';
        btn.disabled = false;
    }

    async deletePage(pageId) {
        if (confirm('Are you sure you want to delete this page?')) {
            try {
                await PageManager.deletePage(pageId);
                alert('Page deleted successfully!');
                
                // Refresh pages view
                const content = document.getElementById('mainContent');
                content.innerHTML = await PageManager.getPagesHTML();
                
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    }

    editPage(pageId) {
        alert(`Edit page: ${pageId} - Edit feature coming soon!`);
    }
}

// Initialize page editor
document.addEventListener('DOMContentLoaded', () => {
    window.pageEditor = new PageEditor();
});

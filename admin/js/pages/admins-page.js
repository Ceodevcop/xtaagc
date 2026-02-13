// admin/js/pages/admins-page.js
import { db } from '../firebase-init.js';
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { Notifications } from '../components/notifications.js';
import { DataTable } from '../components/table.js';
import { Modal } from '../components/modal.js';

export async function render(admin) {
    const adminsSnap = await getDocs(collection(db, "admins"));
    const admins = [];
    adminsSnap.forEach(doc => admins.push({ id: doc.id, ...doc.data() }));
    
    const table = new DataTable({
        columns: [
            { field: 'name', label: 'Name' },
            { field: 'email', label: 'Email' },
            { 
                field: 'roleName', 
                label: 'Role',
                formatter: (val) => val || 'Administrator',
                badge: (val) => {
                    if (val?.includes('Super')) return 'success';
                    if (val?.includes('Admin')) return 'info';
                    return 'warning';
                }
            },
            { 
                field: 'createdAt', 
                label: 'Created',
                formatter: (val) => val ? new Date(val.toDate?.() || val).toLocaleDateString() : 'N/A'
            },
            { 
                field: 'status', 
                label: 'Status',
                formatter: () => 'Active',
                badge: 'success'
            }
        ],
        data: admins,
        actions: [
            { 
                label: 'Edit', 
                icon: 'edit', 
                class: 'btn-outline',
                handler: '(id) => window.adminManager?.editAdmin(id)' 
            },
            { 
                label: 'Delete', 
                icon: 'trash', 
                class: 'btn-danger',
                handler: '(id) => window.adminManager?.deleteAdmin(id)' 
            }
        ]
    });
    
    return `
        <div class="content-header">
            <h1 class="page-title"><i class="fas fa-user-shield" style="color: var(--accent);"></i> Administrator Management</h1>
            <div style="display:flex; gap:10px;">
                <button class="btn" onclick="window.location.href='/setup-admin.html'">
                    <i class="fas fa-plus"></i> Add Administrator
                </button>
            </div>
        </div>
        
        <div class="section-card">
            <div class="section-header">
                <h2><i class="fas fa-users-cog"></i> All Administrators</h2>
                <span class="badge badge-info">${admins.length} Total</span>
            </div>
            ${table.render()}
        </div>
        
        <div class="section-card">
            <div class="section-header">
                <h2><i class="fas fa-shield-alt"></i> Admin Roles & Permissions</h2>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px;">
                <div style="padding:16px; background:var(--light); border-radius:12px;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                        <div style="width:40px; height:40px; background:var(--success); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white;">
                            <i class="fas fa-crown"></i>
                        </div>
                        <div>
                            <h4 style="margin-bottom:4px;">Super Administrator</h4>
                            <p style="font-size:12px; color:#64748b;">Full system access</p>
                        </div>
                    </div>
                    <p style="font-size:13px;">Create/edit/delete pages, manage all users, manage admins, view analytics, system settings</p>
                </div>
                <div style="padding:16px; background:var(--light); border-radius:12px;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                        <div style="width:40px; height:40px; background:var(--info); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white;">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div>
                            <h4 style="margin-bottom:4px;">Administrator</h4>
                            <p style="font-size:12px; color:#64748b;">Content management</p>
                        </div>
                    </div>
                    <p style="font-size:13px;">Create/edit pages, manage users, view orders and investments</p>
                </div>
                <div style="padding:16px; background:var(--light); border-radius:12px;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                        <div style="width:40px; height:40px; background:var(--warning); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white;">
                            <i class="fas fa-user-edit"></i>
                        </div>
                        <div>
                            <h4 style="margin-bottom:4px;">Editor</h4>
                            <p style="font-size:12px; color:#64748b;">Limited access</p>
                        </div>
                    </div>
                    <p style="font-size:13px;">Create and edit pages only, view own activity</p>
                </div>
            </div>
        </div>
    `;
}

export function init(admin) {
    window.adminManager = {
        async deleteAdmin(adminId) {
            if (adminId === admin?.uid) {
                Notifications.error('You cannot delete your own account');
                return;
            }
            
            if (confirm('Are you sure you want to remove this administrator?')) {
                try {
                    await deleteDoc(doc(db, "admins", adminId));
                    Notifications.success('Administrator removed successfully');
                    setTimeout(() => window.adminCore.loadPage('admins'), 1000);
                } catch (error) {
                    Notifications.error('Error: ' + error.message);
                }
            }
        },
        
        editAdmin(adminId) {
            const modal = new Modal({
                title: 'Edit Administrator',
                size: 'md'
            });
            
            modal.setContent(`<p style="padding:20px; text-align:center;">Edit feature coming soon!</p>`);
            modal.setFooter(`<button class="btn btn-outline" onclick="this.closest('.modal').classList.remove('active')">Close</button>`);
            modal.open();
        }
    };
}

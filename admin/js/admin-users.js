// admin/js/admin-users.js
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from './firebase-init.js';

const db = getFirestore(app);

export const UserManager = {
    // Get all users HTML
    async getUsersHTML() {
        const usersSnap = await getDocs(collection(db, "users"));
        
        let rows = '';
        usersSnap.forEach(doc => {
            const user = doc.data();
            rows += `
                <tr>
                    <td><strong>${user.name || user.fullName || 'N/A'}</strong></td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.userType || user.accountType || 'individual'}</td>
                    <td><span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-pending'}">${user.status || 'active'}</span></td>
                    <td>${user.createdAt ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm" onclick="window.userManager?.viewUser('${doc.id}')">View</button>
                    </td>
                </tr>
            `;
        });
        
        return `
            <div class="header">
                <h1 style="color:#0a2540;">User Management</h1>
                <div style="color:#64748b;">Total Users: ${usersSnap.size || 0}</div>
            </div>
            
            <div class="section-card">
                <h2 style="color:#0a2540; margin-bottom:20px;">All Users</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="6" style="text-align:center; padding:40px;">No users found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Get user details
    async getUserDetails(userId) {
        const userDoc = await getDoc(doc(db, "users", userId));
        return userDoc.exists() ? userDoc.data() : null;
    },

    // Update user status
    async updateUserStatus(userId, status) {
        await updateDoc(doc(db, "users", userId), { status });
        return { success: true };
    }
};

// User Management UI Controller
export class UserManagerUI {
    async viewUser(userId) {
        const user = await UserManager.getUserDetails(userId);
        if (user) {
            alert(`
User Details:
Name: ${user.name || user.fullName}
Email: ${user.email}
Type: ${user.userType || user.accountType}
Status: ${user.status || 'active'}
Joined: ${user.createdAt ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString() : 'N/A'}
            `);
        }
    }
}

// Initialize user manager
document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManagerUI();
});

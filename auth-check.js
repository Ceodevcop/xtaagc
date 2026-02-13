// auth-check.js - Include in ALL dashboard pages
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class AuthChecker {
    constructor() {
        this.auth = getAuth();
        this.db = getFirestore();
        this.currentUser = null;
        this.userData = null;
        this.requiredType = null; // 'company', 'individual', or null for any
    }

    // Check if user is authenticated
    async requireAuth(redirectUrl = '/register.html') {
        return new Promise((resolve) => {
            onAuthStateChanged(this.auth, async (user) => {
                if (!user) {
                    // Not logged in - redirect to login
                    window.location.href = redirectUrl + '#login';
                    return;
                }

                this.currentUser = user;
                
                // Get user data from Firestore
                await this.loadUserData();
                
                resolve(user);
            });
        });
    }

    // Load user data from Firestore
    async loadUserData() {
        if (!this.currentUser) return null;

        // Check companies collection
        const companyDoc = await getDoc(doc(this.db, "companies", this.currentUser.uid));
        if (companyDoc.exists()) {
            this.userData = { type: 'company', ...companyDoc.data() };
            return this.userData;
        }

        // Check individuals collection
        const individualDoc = await getDoc(doc(this.db, "individuals", this.currentUser.uid));
        if (individualDoc.exists()) {
            this.userData = { type: 'individual', ...individualDoc.data() };
            return this.userData;
        }

        return null;
    }

    // Get current user
    getUser() {
        return this.currentUser;
    }

    // Get user data
    getUserData() {
        return this.userData;
    }

    // Check if user is specific type
    async requireType(type, redirectUrl = '/register.html') {
        await this.requireAuth(redirectUrl);
        
        if (!this.userData || this.userData.type !== type) {
            // Wrong user type - redirect
            window.location.href = redirectUrl;
            return false;
        }
        
        return true;
    }

    // Logout
    async logout(redirectUrl = '/') {
        try {
            await signOut(this.auth);
            window.location.href = redirectUrl;
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Add logout button handler
    setupLogoutButton(buttonId, redirectUrl = '/') {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout(redirectUrl);
            });
        }
    }

    // Display user info in dashboard
    displayUserInfo(containerId) {
        if (!this.userData) return;
        
        const container = document.getElementById(containerId);
        if (!container) return;

        const name = this.userData.type === 'company' 
            ? this.userData.companyName 
            : this.userData.fullName || this.userData.name;

        container.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:40px; height:40px; background:#c19a6b; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:700;">
                    ${name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                    <div style="font-weight:600;">${name || 'User'}</div>
                    <div style="font-size:12px; color:#64748b;">${this.userData.email || ''}</div>
                </div>
            </div>
        `;
    }
}

// Export singleton
export const authChecker = new AuthChecker();

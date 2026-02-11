// admin/js/auth.js
import { auth } from '../../firebase-config.js';
import { 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Set session persistence
setPersistence(auth, browserSessionPersistence);

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        onAuthStateChanged(auth, async (user) => {
            this.currentUser = user;
            
            if (user) {
                const idTokenResult = await user.getIdTokenResult();
                const isAdmin = idTokenResult.claims.admin === true;
                
                const currentPage = window.location.pathname;
                
                // Redirect logic
                if (currentPage.includes('admin-login') || currentPage === '/admin/') {
                    if (isAdmin) {
                        window.location.href = 'dashboard.html';
                    }
                } else if (!isAdmin) {
                    window.location.href = 'index.html';
                }
            } else if (!currentPage.includes('admin-login') && currentPage !== '/admin/') {
                window.location.href = 'index.html';
            }
        });
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idTokenResult = await userCredential.user.getIdTokenResult();
            
            if (idTokenResult.claims.admin !== true) {
                await this.logout();
                throw new Error('Admin privileges required');
            }
            
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async isAdmin() {
        if (!this.currentUser) return false;
        const idTokenResult = await this.currentUser.getIdTokenResult();
        return idTokenResult.claims.admin === true;
    }
}

// Initialize auth manager
export const authManager = new AuthManager();

// Export for use in other files
export { auth };

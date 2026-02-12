// admin-auth.js
import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export class AdminAuth {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        onAuthStateChanged(auth, async (user) => {
            this.currentUser = user;
            
            if (user) {
                this.isAdmin = await this.checkAdminStatus(user);
                
                // Dispatch custom event for admin login/logout
                window.dispatchEvent(new CustomEvent('adminAuthChanged', { 
                    detail: { user, isAdmin: this.isAdmin }
                }));
            } else {
                this.isAdmin = false;
                window.dispatchEvent(new CustomEvent('adminAuthChanged', { 
                    detail: { user: null, isAdmin: false }
                }));
            }
        });
    }

    async checkAdminStatus(user) {
        try {
            // Check custom claims first
            const idTokenResult = await user.getIdTokenResult();
            if (idTokenResult.claims.admin === true) {
                return true;
            }
            
            // Fallback: check Firestore admin collection
            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            return adminDoc.exists();
            
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check if admin
            const isAdmin = await this.checkAdminStatus(user);
            
            if (!isAdmin) {
                await this.logout();
                return { 
                    success: false, 
                    error: 'Access denied. Admin privileges required.' 
                };
            }
            
            return { success: true, user };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCurrentAdmin() {
        if (!this.currentUser || !this.isAdmin) return null;
        
        try {
            const adminDoc = await getDoc(doc(db, "admins", this.currentUser.uid));
            
            if (adminDoc.exists()) {
                return { id: adminDoc.id, ...adminDoc.data() };
            }
            
            // Create admin record if it doesn't exist
            const adminData = {
                email: this.currentUser.email,
                role: 'admin',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                uid: this.currentUser.uid
            };
            
            await setDoc(doc(db, "admins", this.currentUser.uid), adminData);
            return adminData;
            
        } catch (error) {
            console.error('Error getting admin profile:', error);
            return null;
        }
    }

    async requireAdmin() {
        if (!this.currentUser || !this.isAdmin) {
            window.location.href = '/404.html';
            return false;
        }
        return true;
    }
}

export const adminAuth = new AdminAuth();

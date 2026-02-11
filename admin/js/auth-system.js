// admin/js/auth-system.js
import { auth, functions } from '../../firebase-config.js';
import { 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    sendEmailVerification,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    httpsCallable 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

export class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.authStateListeners = [];
        this.init();
    }

    async init() {
        // Set persistence (session for admin, local for users)
        await setPersistence(auth, browserSessionPersistence);
        
        // Listen to auth state changes
        onAuthStateChanged(auth, async (user) => {
            this.currentUser = user;
            
            if (user) {
                // Check if user is admin
                await this.checkAdminStatus(user);
            } else {
                this.isAdmin = false;
            }
            
            // Notify listeners
            this.notifyAuthStateChange();
        });
    }

    async checkAdminStatus(user) {
        try {
            // Get ID token to check custom claims
            const idTokenResult = await user.getIdTokenResult();
            this.isAdmin = idTokenResult.claims?.admin === true;
            
            // If no claims found, check via function
            if (!idTokenResult.claims) {
                const checkAdmin = httpsCallable(functions, 'checkAdminStatus');
                const result = await checkAdmin();
                this.isAdmin = result.data.isAdmin;
                
                // Refresh token to include new claims
                await user.getIdToken(true);
            }
            
            return this.isAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            this.isAdmin = false;
            return false;
        }
    }

    async login(email, password, rememberMe = false) {
        try {
            // Set persistence based on remember me
            const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistence);
            
            // Sign in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check if email is verified (optional for admin)
            if (!user.emailVerified) {
                console.warn('Admin email not verified');
                // You might want to require email verification for admin
                // await sendEmailVerification(user);
            }
            
            // Check admin status
            const isAdmin = await this.checkAdminStatus(user);
            
            if (!isAdmin) {
                await this.logout();
                throw new Error('Admin privileges required. Please contact system administrator.');
            }
            
            // Update last login in Firestore
            await this.updateLastLogin(user.uid);
            
            return {
                success: true,
                user: user,
                isAdmin: true
            };
            
        } catch (error) {
            console.error('Login error:', error);
            
            // User-friendly error messages
            let errorMessage = 'Login failed. Please try again.';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection.';
                    break;
            }
            
            throw new Error(errorMessage);
        }
    }

    async logout() {
        try {
            await signOut(auth);
            this.currentUser = null;
            this.isAdmin = false;
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { 
                success: true, 
                message: 'Password reset email sent. Please check your inbox.' 
            };
        } catch (error) {
            console.error('Password reset error:', error);
            
            let errorMessage = 'Failed to send reset email.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            }
            
            throw new Error(errorMessage);
        }
    }

    async updateLastLogin(uid) {
        try {
            const { doc, updateDoc, getFirestore } = await import(
                "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
            );
            
            const userRef = doc(getFirestore(), 'users', uid);
            await updateDoc(userRef, {
                lastLogin: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    async getCurrentUserProfile() {
        if (!this.currentUser) return null;
        
        try {
            const { doc, getDoc, getFirestore } = await import(
                "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
            );
            
            const userDoc = await getDoc(doc(getFirestore(), 'users', this.currentUser.uid));
            return userDoc.exists() ? userDoc.data() : null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    // Listener system for auth state changes
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    notifyAuthStateChange() {
        this.authStateListeners.forEach(callback => {
            callback({
                user: this.currentUser,
                isAdmin: this.isAdmin,
                isAuthenticated: !!this.currentUser
            });
        });
    }

    // Check if user has specific permission
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Get claims from ID token
        return this.currentUser.getIdTokenResult()
            .then(idTokenResult => {
                const claims = idTokenResult.claims;
                return claims?.admin === true || claims?.[permission] === true;
            })
            .catch(() => false);
    }

    // Get auth token for API requests
    async getAuthToken() {
        if (!this.currentUser) return null;
        
        try {
            return await this.currentUser.getIdToken();
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    // Force refresh token (useful after claims update)
    async refreshToken() {
        if (!this.currentUser) return null;
        
        try {
            return await this.currentUser.getIdToken(true);
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    }
}

// Create singleton instance
export const authSystem = new AuthSystem();

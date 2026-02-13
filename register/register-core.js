// register/register-core.js
import { uiMain } from './ui/ui-main.js';
import { companyRegister } from './register-company.js';
import { individualRegister } from './register-individual.js';
import { Notifications } from '../components/notifications.js';
import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

class RegisterCore {
    constructor() {
        this.init();
    }
    
    init() {
        // Initialize UI
        uiMain.init();
        
        // Check if user is already logged in
        this.checkAuthStatus();
        
        // Check for hash in URL
        this.checkUrlHash();
        
        // Initialize back to top
        this.initBackToTop();
        
        // Show welcome message
        setTimeout(() => {
            Notifications.info('Choose your account type to get started');
        }, 1000);
    }
    
    checkAuthStatus() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, redirect to appropriate dashboard
                this.redirectToDashboard(user);
            }
        });
    }
    
    async redirectToDashboard(user) {
        // Check if company or individual
        // This would need to check Firestore
        // For now, just show notification
        Notifications.info('You are already logged in');
    }
    
    checkUrlHash() {
        if (window.location.hash === '#login') {
            // Switch to login tab if exists
            const loginTab = document.getElementById('loginTab');
            if (loginTab) {
                setTimeout(() => {
                    loginTab.click();
                    document.querySelector('.auth-card')?.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        }
    }
    
    initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.registerCore = new RegisterCore();
});

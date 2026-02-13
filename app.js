// app.js - Main Application Controller
import './components/notifications.js';
import './components/modal.js';
import './components/carousel.js';
import './components/navbar.js';
import hero from './sections/hero.js';
import stats from './sections/stats.js';
import sectors from './sections/sectors.js';
import approach from './sections/approach.js';
import testimonials from './sections/testimonials.js';
import ceo from './sections/ceo.js';
import contact from './sections/contact.js';
import cta from './sections/cta.js';
import footer from './sections/footer.js';

class App {
    constructor() {
        this.sections = {
            hero, stats, sectors, approach,
            testimonials, ceo, contact, cta, footer
        };
        this.init();
    }
    
    async init() {
        // Render all sections
        this.renderSections();
        
        // Initialize back to top button
        this.initBackToTop();
        
        // Initialize ad manager
        if (window.adManager) {
            window.adManager.init();
        }
        
        // Check for admin login status
        this.checkAdminStatus();
        
        // Show welcome message after delay
        setTimeout(() => {
            Notifications.info('Welcome to TAAGC Global');
        }, 2000);
    }
    
    renderSections() {
        const main = document.getElementById('main-content');
        let html = '';
        
        // Render all sections in order
        const order = ['hero', 'stats', 'sectors', 'approach', 'testimonials', 'ceo', 'contact', 'cta'];
        order.forEach(key => {
            if (this.sections[key]) {
                html += this.sections[key].render();
            }
        });
        
        main.innerHTML = html;
        
        // Initialize sections that have init methods
        order.forEach(key => {
            if (this.sections[key]?.init) {
                setTimeout(() => this.sections[key].init(), 100);
            }
        });
        
        // Render footer separately
        document.getElementById('footer-container').innerHTML = footer.render();
        if (footer.init) footer.init();
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
    
    checkAdminStatus() {
        const admin = sessionStorage.getItem('taagc_admin');
        if (admin) {
            // Add admin badge to navbar
            const nav = document.querySelector('.navbar-nav');
            if (nav) {
                const adminLi = document.createElement('li');
                adminLi.className = 'nav-item';
                adminLi.innerHTML = `<a href="/admin/dashboard.html" class="nav-link" style="color: var(--accent);">
                    <i class="fas fa-shield-alt"></i> Admin
                </a>`;
                nav.appendChild(adminLi);
            }
        }
    }
}

// Start app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// dynamic-router.js
import { pageRenderer } from './page-renderer.js';
import { authService } from './firebase-config.js';

export class DynamicRouter {
    constructor() {
        this.routes = new Map();
        this.init();
    }

    init() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // Skip external links
            if (href.startsWith('http') || href.startsWith('//') || 
                href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }
            
            // Skip hash links
            if (href.startsWith('#')) {
                return;
            }
            
            e.preventDefault();
            this.navigateTo(href);
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            const path = window.location.pathname.substring(1);
            this.loadPage(path || 'home');
        });

        // Load initial page
        const path = window.location.pathname.substring(1);
        this.loadPage(path || 'home');
    }

    async navigateTo(url) {
        const path = url.replace('/', '');
        window.history.pushState({}, '', `/${path}`);
        await this.loadPage(path);
    }

    async loadPage(slug) {
        const content = document.getElementById('main-content');
        if (!content) return;
        
        // Show loading
        content.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        try {
            // Try to render from Firestore
            const rendered = await pageRenderer.renderPage(slug);
            
            if (!rendered) {
                // Page doesn't exist - redirect to 404 creator
                window.location.href = '/404.html';
            }
            
        } catch (error) {
            console.error('Error loading page:', error);
            window.location.href = '/404.html';
        }
    }
}

export const dynamicRouter = new DynamicRouter();

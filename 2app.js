// app.js - SPA Router and Page Controller
import { authSystem } from './admin/js/auth-system.js';

class TAAGCApp {
    constructor() {
        this.currentPage = 'home';
        this.pages = {};
        this.cache = {};
        this.init();
    }

    async init() {
        // Register all pages
        this.registerPages();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
            }, 500);
        }, 800);

        // Setup navigation
        this.setupRouter();
        
        // Load initial page based on URL
        await this.handleInitialRoute();
        
        // Setup auth state listener
        this.setupAuthListener();
        
        // Preload other pages
        this.preloadPages();
    }

    registerPages() {
        // Import page renderers
        this.pages = {
            'home': window.HomePage,
            'sectors': window.SectorsPage,
            'approach': window.ApproachPage,
            'testimonials': window.TestimonialsPage,
            'contact': window.ContactPage,
            'ceo': window.CeoPage,
            'services': window.SectorsPage, // alias
            'partners': window.TestimonialsPage, // alias
            'invest': window.ContactPage // alias
        };
    }

    setupRouter() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // External links
            if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }
            
            // Hash links (same page anchors)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                if (targetId && targetId !== '') {
                    const element = document.getElementById(targetId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                return;
            }
            
            // Internal page navigation
            e.preventDefault();
            const path = href.replace('/', '') || 'home';
            this.navigateTo(path);
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const path = window.location.pathname.replace('/', '') || 'home';
            this.loadPage(path, false);
        });
    }

    async handleInitialRoute() {
        const path = window.location.pathname.replace('/', '') || 'home';
        await this.loadPage(path, true);
    }

    async navigateTo(page, addToHistory = true) {
        if (page === this.currentPage) return;
        
        await this.loadPage(page, addToHistory);
    }

    async loadPage(pageSlug, addToHistory = true) {
        // Show loading indicator
        this.showPageTransition();
        
        try {
            // Get page renderer
            const PageRenderer = this.pages[pageSlug];
            
            if (!PageRenderer) {
                // 404 - redirect to home
                console.warn(`Page ${pageSlug} not found, redirecting to home`);
                return this.loadPage('home', addToHistory);
            }

            // Check cache first
            if (this.cache[pageSlug]) {
                document.getElementById('content').innerHTML = this.cache[pageSlug];
            } else {
                // Render fresh content
                const content = PageRenderer.render();
                document.getElementById('content').innerHTML = content;
                this.cache[pageSlug] = content;
            }

            // Update current page
            this.currentPage = pageSlug;
            
            // Update active nav link
            this.updateActiveNavLink(pageSlug);
            
            // Update browser URL if needed
            if (addToHistory) {
                const url = pageSlug === 'home' ? '/' : `/${pageSlug}`;
                window.history.pushState({ page: pageSlug }, '', url);
            }
            
            // Update page title and meta
            this.updatePageMetadata(pageSlug);
            
            // Initialize page-specific scripts
            if (PageRenderer.init) {
                PageRenderer.init();
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error loading page:', error);
            document.getElementById('content').innerHTML = '<div class="error-page">Error loading page. Please try again.</div>';
        } finally {
            this.hidePageTransition();
        }
    }

    showPageTransition() {
        const content = document.getElementById('content');
        content.style.opacity = '0.5';
        content.style.transition = 'opacity 0.2s';
    }

    hidePageTransition() {
        const content = document.getElementById('content');
        content.style.opacity = '1';
    }

    updateActiveNavLink(pageSlug) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `/${pageSlug}` || (pageSlug === 'home' && href === '/')) {
                link.classList.add('active');
            }
        });
    }

    updatePageMetadata(pageSlug) {
        const metadata = {
            'home': {
                title: 'TAAGC Global | Triple A AHAL Global Concept',
                description: 'Institutional-grade solutions across five core sectors. Global excellence, delivered.'
            },
            'sectors': {
                title: 'Our Sectors | TAAGC Global',
                description: 'Five strategic sectors: Agriculture, Grain Processing, ICT, General Contracts, and General Merchandise.'
            },
            'approach': {
                title: 'Strategic Approach | TAAGC Global',
                description: 'Our integrated model ensures seamless execution across borders and sectors.'
            },
            'testimonials': {
                title: 'Partner Perspectives | TAAGC Global',
                description: 'Hear from global partners about their experience working with TAAGC.'
            },
            'contact': {
                title: 'Contact Us | TAAGC Global',
                description: 'Connect with our strategic partnerships team for a confidential consultation.'
            },
            'ceo': {
                title: 'CEO Message | TAAGC Global',
                description: 'Message from Ahmad Hamza, CEO of Triple A AHAL Global Concept.'
            }
        };

        const meta = metadata[pageSlug] || metadata.home;
        
        document.getElementById('dynamicTitle').textContent = meta.title;
        document.getElementById('dynamicDescription').setAttribute('content', meta.description);
        document.getElementById('ogTitle').setAttribute('content', meta.title);
        document.getElementById('ogDescription').setAttribute('content', meta.description);
    }

    preloadPages() {
        // Preload all pages for instant navigation
        setTimeout(() => {
            ['sectors', 'approach', 'testimonials', 'contact', 'ceo'].forEach(page => {
                if (this.pages[page] && !this.cache[page]) {
                    this.cache[page] = this.pages[page].render();
                }
            });
        }, 2000);
    }

    setupAuthListener() {
        authSystem.onAuthStateChange((state) => {
            if (state.isAuthenticated && state.isAdmin) {
                this.addAdminLink();
            }
        });
    }

    addAdminLink() {
        const navCta = document.querySelector('.nav-cta');
        if (navCta && !document.querySelector('.admin-link')) {
            const adminLink = document.createElement('a');
            adminLink.href = '/admin/dashboard.html';
            adminLink.className = 'btn btn-outline btn-sm admin-link';
            adminLink.style.marginLeft = '10px';
            adminLink.innerHTML = '<i class="fas fa-shield-alt"></i> Admin';
            navCta.appendChild(adminLink);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TAAGCApp();
});
// app.js - Add these routes to registerPages()
registerPages() {
    this.pages = {
        'home': window.HomePage,
        'sectors': window.SectorsPage,
        'agriculture': window.SectorAgriculturePage,
        'grain-processing': window.SectorGrainPage,
        'ict': window.SectorICTPage,
        'general-contracts': window.SectorContractsPage,
        'general-merchandise': window.SectorMerchandisePage,
        'approach': window.ApproachPage,
        'testimonials': window.TestimonialsPage,
        'contact': window.ContactPage,
        'ceo': window.CeoPage,
        
        // Aliases
        'services': window.SectorsPage,
        'agri': window.SectorAgriculturePage,
        'grain': window.SectorGrainPage,
        'contracts': window.SectorContractsPage,
        'merchandise': window.SectorMerchandisePage,
        'partners': window.TestimonialsPage,
        'invest': window.ContactPage
    };
}

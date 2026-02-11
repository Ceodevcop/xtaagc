// components/navbar.js
export const Navbar = {
    render() {
        return `
            <nav class="navbar" id="navbar">
                <div class="container">
                    <div class="navbar-content">
                        <a href="/" class="navbar-brand">
                            <span class="brand-text"><span>TAAGC</span> GLOBAL</span>
                        </a>
                        
                        <div class="navbar-menu" id="navbarMenu">
                            <ul class="navbar-nav">
                                <li class="nav-item"><a href="/" class="nav-link">Home</a></li>
                                <li class="nav-item"><a href="/sectors" class="nav-link">Sectors</a></li>
                                <li class="nav-item"><a href="/approach" class="nav-link">Approach</a></li>
                                <li class="nav-item"><a href="/testimonials" class="nav-link">Partners</a></li>
                                <li class="nav-item"><a href="/ceo" class="nav-link">CEO</a></li>
                                <li class="nav-item"><a href="/contact" class="nav-link">Contact</a></li>
                                <li class="nav-item nav-cta">
                                    <a href="/contact" class="btn btn-primary btn-sm">
                                        <i class="fas fa-handshake"></i> Partner With Us
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                        <button class="navbar-toggler" id="navbarToggler">
                            <span class="bar"></span>
                            <span class="bar"></span>
                            <span class="bar"></span>
                        </button>
                    </div>
                </div>
            </nav>
        `;
    },
    
    init() {
        // Navbar scroll effect
        const navbar = document.getElementById('navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }

        // Mobile menu toggle
        const toggler = document.getElementById('navbarToggler');
        const menu = document.getElementById('navbarMenu');
        
        if (toggler && menu) {
            toggler.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('active');
                toggler.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navbar?.contains(e.target)) {
                    menu.classList.remove('active');
                    toggler.classList.remove('active');
                }
            });
        }
    }
};

// Render navbar on load
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = Navbar.render();
        Navbar.init();
    }
});

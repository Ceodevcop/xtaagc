// components/navbar.js
export const Navbar = {
    render() {
        return `
            <nav class="navbar" id="navbar">
                <div class="container">
                    <div class="navbar-content">
                        <a href="/" class="navbar-brand">
                            <div class="navbar-logo">A</div>
                            <div class="navbar-brand-text"><span>TAAGC</span> GLOBAL</div>
                        </a>
                        
                        <div class="navbar-menu" id="navbarMenu">
                            <ul class="navbar-nav">
                                <li class="nav-item"><a href="#home" class="nav-link active">Home</a></li>
                                <li class="nav-item"><a href="#sectors" class="nav-link">Sectors</a></li>
                                <li class="nav-item"><a href="#approach" class="nav-link">Approach</a></li>
                                <li class="nav-item"><a href="#testimonials" class="nav-link">Partners</a></li>
                                <li class="nav-item"><a href="#ceo" class="nav-link">CEO</a></li>
                                <li class="nav-item"><a href="/staff.html" class="nav-link">Team</a></li>
                                <li class="nav-item"><a href="#contact" class="nav-link">Contact</a></li>
                                <li class="nav-item nav-cta">
                                    <a href="/register.html" class="nav-link">
                                        <i class="fas fa-handshake"></i> Partner
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                        <button class="navbar-toggler" id="navbarToggler">
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>
            </nav>
        `;
    },
    
    init() {
        const navbar = document.getElementById('navbar');
        const toggler = document.getElementById('navbarToggler');
        const menu = document.getElementById('navbarMenu');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        if (toggler) {
            toggler.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('active');
                toggler.classList.toggle('active');
            });
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    menu?.classList.remove('active');
                    toggler?.classList.remove('active');
                }
            });
        });
        
        // Active nav link on scroll
        const sections = document.querySelectorAll('section[id]');
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
};

// Render navbar
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = Navbar.render();
        Navbar.init();
    }
});

// pages/home.js
export const HomePage = {
    render() {
        return `
            <!-- HERO SECTION -->
            <section id="home" class="hero">
                <div class="hero-overlay"></div>
                <div class="container">
                    <div class="hero-content">
                        <span class="hero-badge">
                            <i class="fas fa-award"></i> INSTITUTIONAL-GRADE EXCELLENCE
                        </span>
                        <h1 class="hero-title">
                            Global Excellence Across <span class="text-gold">Five Core Sectors</span>
                        </h1>
                        <p class="hero-subtitle">
                            TAAGC delivers institutional-grade solutions in Agriculture, Grain Processing, ICT, 
                            General Contracts, and General Merchandise. Partner with us for sustainable growth.
                        </p>
                        <div class="hero-buttons">
                            <a href="/sectors" class="btn btn-primary">
                                <i class="fas fa-arrow-right"></i> Explore Our Sectors
                            </a>
                            <a href="/contact" class="btn btn-outline">
                                <i class="fas fa-calendar"></i> Schedule Consultation
                            </a>
                        </div>
                    </div>
                </div>
                <div class="hero-scroll">
                    <a href="#stats-section" class="scroll-link">
                        <span class="scroll-text">Discover</span>
                        <i class="fas fa-chevron-down"></i>
                    </a>
                </div>
            </section>

            <!-- STATS SECTION -->
            <section id="stats-section" class="stats-section">
                <div class="container">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-cubes"></i></div>
                            <div class="stat-number">5</div>
                            <div class="stat-label">Core Sectors</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-globe-americas"></i></div>
                            <div class="stat-number">50+</div>
                            <div class="stat-label">Countries</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                            <div class="stat-number">15+</div>
                            <div class="stat-label">Years Experience</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-handshake"></i></div>
                            <div class="stat-number">500+</div>
                            <div class="stat-label">Global Partners</div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    init() {
        // Initialize any interactive elements on home page
        console.log('Home page initialized');
        
        // Add scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.stat-card, .hero-content').forEach(el => {
            observer.observe(el);
        });
    }
};

window.HomePage = HomePage;

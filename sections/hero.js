// sections/hero.js
export default {
    render() {
        return `
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
                            <a href="#sectors" class="btn btn-primary">
                                <i class="fas fa-arrow-right"></i> Explore Our Sectors
                            </a>
                            <a href="#contact" class="btn btn-outline-light">
                                <i class="fas fa-calendar"></i> Schedule Consultation
                            </a>
                        </div>
                    </div>
                </div>
                <div class="hero-scroll">
                    <a href="#stats">
                        <span class="scroll-text">Discover</span>
                        <i class="fas fa-chevron-down"></i>
                    </a>
                </div>
            </section>
        `;
    }
};

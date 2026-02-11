// pages/approach.js
export const ApproachPage = {
    render() {
        return `
            <section id="approach" class="approach-section">
                <div class="container">
                    <div class="approach-grid">
                        <div class="approach-content">
                            <span class="section-subtitle">Our Methodology</span>
                            <h2 class="section-title">Strategic <span class="text-gold">Approach</span></h2>
                            <p class="approach-text">
                                We combine deep sector expertise with a disciplined approach to deliver 
                                sustainable value for our partners. Our integrated model ensures seamless 
                                execution across borders and sectors.
                            </p>
                            
                            <div class="approach-features">
                                <div class="feature-item">
                                    <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
                                    <div class="feature-text">
                                        <h4>Institutional-Grade</h4>
                                        <p>Fortune 500-level processes and compliance standards</p>
                                    </div>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon"><i class="fas fa-globe"></i></div>
                                    <div class="feature-text">
                                        <h4>Global Network</h4>
                                        <p>Active operations across 50+ countries</p>
                                    </div>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon"><i class="fas fa-hand-holding-usd"></i></div>
                                    <div class="feature-text">
                                        <h4>Sustainable ROI</h4>
                                        <p>Measurable returns through strategic optimization</p>
                                    </div>
                                </div>
                            </div>
                            
                            <a href="/contact" class="btn btn-primary">
                                <i class="fas fa-handshake"></i> Discuss Your Objectives
                            </a>
                        </div>
                        
                        <div class="approach-image">
                            <div class="image-wrapper">
                                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800" alt="Strategic Planning" loading="lazy">
                                <div class="experience-badge">
                                    <span class="years">15+</span>
                                    <span class="text">Years of Excellence</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    init() {
        console.log('Approach page initialized');
    }
};

window.ApproachPage = ApproachPage;

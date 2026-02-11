// pages/sectors.js
export const SectorsPage = {
    render() {
        return `
            <section id="sectors" class="sectors-section">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Our Expertise</span>
                        <h2 class="section-title">Five Strategic <span class="text-gold">Core Sectors</span></h2>
                        <p class="section-description">
                            We operate across five strategic sectors, delivering specialized expertise 
                            and integrated solutions that drive measurable results for our partners.
                        </p>
                    </div>
                    
                    <div class="sectors-grid">
                        <!-- Agriculture -->
                        <div class="sector-card">
                            <div class="sector-icon-wrapper">
                                <div class="sector-icon"><i class="fas fa-seedling"></i></div>
                            </div>
                            <h3>Agriculture</h3>
                            <p>Sustainable farming, agri-processing, and supply chain optimization for food security.</p>
                            <a href="/contact" class="sector-link">Inquire <i class="fas fa-arrow-right"></i></a>
                        </div>
                        
                        <!-- Grain Processing -->
                        <div class="sector-card">
                            <div class="sector-icon-wrapper">
                                <div class="sector-icon"><i class="fas fa-wheat-alt"></i></div>
                            </div>
                            <h3>Grain Processing</h3>
                            <p>Industrial-scale milling, storage, and value-added grain product manufacturing.</p>
                            <a href="/contact" class="sector-link">Inquire <i class="fas fa-arrow-right"></i></a>
                        </div>
                        
                        <!-- ICT -->
                        <div class="sector-card">
                            <div class="sector-icon-wrapper">
                                <div class="sector-icon"><i class="fas fa-microchip"></i></div>
                            </div>
                            <h3>ICT</h3>
                            <p>Enterprise digital transformation, infrastructure deployment, and cybersecurity.</p>
                            <a href="/contact" class="sector-link">Inquire <i class="fas fa-arrow-right"></i></a>
                        </div>
                        
                        <!-- General Contracts -->
                        <div class="sector-card">
                            <div class="sector-icon-wrapper">
                                <div class="sector-icon"><i class="fas fa-file-signature"></i></div>
                            </div>
                            <h3>General Contracts</h3>
                            <p>Civil works, infrastructure development, and turnkey project execution.</p>
                            <a href="/contact" class="sector-link">Inquire <i class="fas fa-arrow-right"></i></a>
                        </div>
                        
                        <!-- General Merchandise -->
                        <div class="sector-card">
                            <div class="sector-icon-wrapper">
                                <div class="sector-icon"><i class="fas fa-box"></i></div>
                            </div>
                            <h3>General Merchandise</h3>
                            <p>Global procurement, logistics, and supply chain solutions for consumer goods.</p>
                            <a href="/contact" class="sector-link">Inquire <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                    
                    <div class="sectors-cta">
                        <a href="/contact" class="btn btn-primary btn-large">
                            <i class="fas fa-file-alt"></i> Request Sector Brochure
                        </a>
                    </div>
                </div>
            </section>
        `;
    },
    
    init() {
        console.log('Sectors page initialized');
    }
};

window.SectorsPage = SectorsPage;

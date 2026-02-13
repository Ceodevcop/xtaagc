// sections/sectors.js
export default {
    render() {
        const sectors = [
            { icon: 'fa-seedling', title: 'Agriculture', desc: 'Sustainable farming, agri-processing, and supply chain optimization.' },
            { icon: 'fa-wheat-alt', title: 'Grain Processing', desc: 'Industrial-scale milling, storage, and value-added manufacturing.' },
            { icon: 'fa-microchip', title: 'ICT', desc: 'Enterprise digital transformation, infrastructure, and cybersecurity.' },
            { icon: 'fa-file-signature', title: 'General Contracts', desc: 'Civil works, infrastructure development, turnkey projects.' },
            { icon: 'fa-box', title: 'General Merchandise', desc: 'Global procurement, logistics, and supply chain solutions.' }
        ];
        
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
                        ${sectors.map(sector => `
                            <div class="sector-card">
                                <div class="sector-icon-wrapper">
                                    <div class="sector-icon"><i class="fas ${sector.icon}"></i></div>
                                </div>
                                <h3>${sector.title}</h3>
                                <p>${sector.desc}</p>
                                <a href="#contact" class="sector-link">
                                    Inquire <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }
};

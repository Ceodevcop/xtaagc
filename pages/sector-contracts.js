// pages/sector-contracts.js
export const SectorContractsPage = {
    render() {
        return `
            <!-- HERO SECTION -->
            <section class="sector-hero sector-hero-contracts">
                <div class="container">
                    <div class="sector-hero-content">
                        <div class="sector-badge">
                            <span class="badge"><i class="fas fa-file-signature"></i> CORE SECTOR 04</span>
                        </div>
                        <h1 class="sector-hero-title">General Contracts & <span class="text-gold">Infrastructure</span></h1>
                        <p class="sector-hero-subtitle">
                            Civil works, infrastructure development, and turnkey project execution. 
                            TAAGC delivers complex projects on time, within budget, and to the highest quality standards.
                        </p>
                        <div class="sector-hero-stats">
                            <div class="stat-item">
                                <div class="stat-number">150+</div>
                                <div class="stat-label">Projects Completed</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">$2.5B</div>
                                <div class="stat-label">Contract Value</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">25</div>
                                <div class="stat-label">Countries</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">0</div>
                                <div class="stat-label">Defects</div>
                            </div>
                        </div>
                        <div class="sector-hero-actions">
                            <a href="/contact" class="btn btn-primary btn-large">
                                <i class="fas fa-handshake"></i> Partner With Us
                            </a>
                            <a href="#capabilities" class="btn btn-outline">
                                <i class="fas fa-hard-hat"></i> Our Capabilities
                            </a>
                        </div>
                    </div>
                </div>
                <div class="sector-pattern"></div>
            </section>

            <!-- CAPABILITIES SECTION -->
            <section id="capabilities" class="sector-capabilities-detailed">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Our Capabilities</span>
                        <h2 class="section-title">Integrated <span class="text-gold">Contracting Services</span></h2>
                    </div>

                    <div class="capabilities-detailed-grid">
                        <div class="capability-detailed-card">
                            <div class="capability-detailed-icon">
                                <i class="fas fa-road"></i>
                            </div>
                            <h3>Civil Engineering</h3>
                            <ul>
                                <li>Roads & highways construction</li>
                                <li>Bridges & interchanges</li>
                                <li>Drainage & flood control</li>
                                <li>Earthworks & site preparation</li>
                            </ul>
                        </div>

                        <div class="capability-detailed-card">
                            <div class="capability-detailed-icon">
                                <i class="fas fa-building"></i>
                            </div>
                            <h3>Building Construction</h3>
                            <ul>
                                <li>Commercial buildings</li>
                                <li>Industrial facilities</li>
                                <li>Residential developments</li>
                                <li>Educational institutions</li>
                                <li>Healthcare facilities</li>
                            </ul>
                        </div>

                        <div class="capability-detailed-card">
                            <div class="capability-detailed-icon">
                                <i class="fas fa-tint"></i>
                            </div>
                            <h3>Water Infrastructure</h3>
                            <ul>
                                <li>Water treatment plants</li>
                                <li>Dam construction</li>
                                <li>Pipeline networks</li>
                                <li>Irrigation systems</li>
                                <li>Desalination plants</li>
                            </ul>
                        </div>

                        <div class="capability-detailed-card">
                            <div class="capability-detailed-icon">
                                <i class="fas fa-bolt"></i>
                            </div>
                            <h3>Power & Energy</h3>
                            <ul>
                                <li>Power plants</li>
                                <li>Substations</li>
                                <li>Transmission lines</li>
                                <li>Solar farms</li>
                                <li>Rural electrification</li>
                            </ul>
                        </div>

                        <div class="capability-detailed-card">
                            <div class="capability-detailed-icon">
                                <i class="fas fa-train"></i>
                            </div>
                            <h3>Transportation</h3>
                            <ul>
                                <li>Railway construction</li>
                                <li>Ports & harbors</li>
                                <li>Airport infrastructure</li>
                                <li>Logistics hubs</li>
                            </ul>
                        </div>

                        <div class="capability-detailed-card">
                            <div class="capability-detailed-icon">
                                <i class="fas fa-oil-can"></i>
                            </div>
                            <h3>Oil & Gas</h3>
                            <ul>
                                <li>Pipeline construction</li>
                                <li>Storage facilities</li>
                                <li>Refinery maintenance</li>
                                <li>Flow stations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- PROJECT MANAGEMENT -->
            <section class="sector-project-management">
                <div class="container">
                    <div class="pm-grid">
                        <div class="pm-content">
                            <span class="section-subtitle">Project Excellence</span>
                            <h2 class="section-title">World-Class <span class="text-gold">Project Management</span></h2>
                            <p class="pm-text">
                                TAAGC employs PMI-certified project managers and industry-leading methodologies 
                                to ensure successful project delivery. Our integrated management system covers 
                                every phase from concept to commissioning.
                            </p>
                            
                            <div class="pm-phases">
                                <div class="phase">
                                    <div class="phase-number">01</div>
                                    <div class="phase-content">
                                        <h4>Initiation</h4>
                                        <p>Feasibility studies, site assessment, stakeholder engagement</p>
                                    </div>
                                </div>
                                <div class="phase">
                                    <div class="phase-number">02</div>
                                    <div class="phase-content">
                                        <h4>Planning</h4>
                                        <p>Detailed design, procurement strategy, resource planning</p>
                                    </div>
                                </div>
                                <div class="phase">
                                    <div class="phase-number">03</div>
                                    <div class="phase-content">
                                        <h4>Execution</h4>
                                        <p>Construction, quality control, safety management</p>
                                    </div>
                                </div>
                                <div class="phase">
                                    <div class="phase-number">04</div>
                                    <div class="phase-content">
                                        <h4>Commissioning</h4>
                                        <p>Testing, handover, operations training</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="pm-certifications">
                            <div class="certification-card">
                                <i class="fas fa-certificate"></i>
                                <h4>ISO 9001:2015</h4>
                                <p>Quality Management</p>
                            </div>
                            <div class="certification-card">
                                <i class="fas fa-shield-alt"></i>
                                <h4>ISO 45001:2018</h4>
                                <p>Health & Safety</p>
                            </div>
                            <div class="certification-card">
                                <i class="fas fa-leaf"></i>
                                <h4>ISO 14001:2015</h4>
                                <p>Environmental Management</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- FEATURED PROJECTS -->
            <section class="sector-featured-projects">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Portfolio</span>
                        <h2 class="section-title">Signature <span class="text-gold">Infrastructure Projects</span></h2>
                    </div>

                    <div class="featured-projects-grid">
                        <div class="featured-project">
                            <div class="project-image">
                                <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600" alt="Bridge Construction">
                            </div>
                            <div class="project-details">
                                <div class="project-tag">Completed 2023</div>
                                <h3>Coastal Highway Bridge</h3>
                                <p>1.2km cable-stayed bridge connecting two major economic zones</p>
                                <div class="project-specs">
                                    <span><i class="fas fa-dollar-sign"></i> $180M</span>
                                    <span><i class="fas fa-clock"></i> 36 months</span>
                                </div>
                            </div>
                        </div>

                        <div class="featured-project">
                            <div class="project-image">
                                <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600" alt="Solar Farm">
                            </div>
                            <div class="project-details">
                                <div class="project-tag">Ongoing</div>
                                <h3>Desert Solar Complex</h3>
                                <p>150MW solar PV farm with energy storage system</p>
                                <div class="project-specs">
                                    <span><i class="fas fa-dollar-sign"></i> $220M</span>
                                    <span><i class="fas fa-clock"></i> 24 months</span>
                                </div>
                            </div>
                        </div>

                        <div class="featured-project">
                            <div class="project-image">
                                <img src="https://images.unsplash.com/photo-1576824367093-3e9f02c0ddfc?w=600" alt="Water Treatment">
                            </div>
                            <div class="project-details">
                                <div class="project-tag">Completed 2024</div>
                                <h3>Regional Water Treatment Plant</h3>
                                <p>50M liters/day capacity serving 2M residents</p>
                                <div class="project-specs">
                                    <span><i class="fas fa-dollar-sign"></i> $95M</span>
                                    <span><i class="fas fa-clock"></i> 28 months</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- PROCUREMENT SERVICES -->
            <section class="sector-procurement">
                <div class="container">
                    <div class="procurement-grid">
                        <div class="procurement-content">
                            <span class="section-subtitle">Strategic Procurement</span>
                            <h2 class="section-title">End-to-End <span class="text-gold">Supply Chain</span></h2>
                            <p class="procurement-text">
                                TAAGC provides comprehensive procurement services for major infrastructure projects, 
                                including equipment sourcing, logistics coordination, and vendor management.
                            </p>
                            <div class="procurement-features">
                                <div class="procurement-feature">
                                    <i class="fas fa-check"></i>
                                    <span>Global supplier network</span>
                                </div>
                                <div class="procurement-feature">
                                    <i class="fas fa-check"></i>
                                    <span>Competitive pricing</span>
                                </div>
                                <div class="procurement-feature">
                                    <i class="fas fa-check"></i>
                                    <span>Quality assurance</span>
                                </div>
                                <div class="procurement-feature">
                                    <i class="fas fa-check"></i>
                                    <span>Just-in-time delivery</span>
                                </div>
                            </div>
                            <a href="/contact" class="btn btn-primary">Inquire About Procurement</a>
                        </div>
                        <div class="procurement-categories">
                            <div class="category-tag">Construction Materials</div>
                            <div class="category-tag">MEP Equipment</div>
                            <div class="category-tag">Heavy Machinery</div>
                            <div class="category-tag">Electrical Systems</div>
                            <div class="category-tag">HVAC</div>
                            <div class="category-tag">Piping & Valves</div>
                            <div class="category-tag">Control Systems</div>
                            <div class="category-tag">Safety Equipment</div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    init() {
        console.log('General Contracts sector page initialized');
    }
};

window.SectorContractsPage = SectorContractsPage;

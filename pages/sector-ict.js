// pages/sector-ict.js
export const SectorICTPage = {
    render() {
        return `
            <!-- HERO SECTION -->
            <section class="sector-hero sector-hero-ict">
                <div class="container">
                    <div class="sector-hero-content">
                        <div class="sector-badge">
                            <span class="badge"><i class="fas fa-microchip"></i> CORE SECTOR 03</span>
                        </div>
                        <h1 class="sector-hero-title">Information & <span class="text-gold">Communication Technology</span></h1>
                        <p class="sector-hero-subtitle">
                            Enterprise digital transformation, infrastructure deployment, and cybersecurity solutions. 
                            TAAGC delivers institutional-grade ICT services for Fortune 500 companies and governments.
                        </p>
                        <div class="sector-hero-stats">
                            <div class="stat-item">
                                <div class="stat-number">150+</div>
                                <div class="stat-label">Enterprise Clients</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">500+</div>
                                <div class="stat-label">Projects Delivered</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">99.9%</div>
                                <div class="stat-label">Uptime SLA</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">24/7</div>
                                <div class="stat-label">Support</div>
                            </div>
                        </div>
                        <div class="sector-hero-actions">
                            <a href="/contact" class="btn btn-primary btn-large">
                                <i class="fas fa-handshake"></i> Partner With Us
                            </a>
                            <a href="#solutions" class="btn btn-outline">
                                <i class="fas fa-cubes"></i> Explore Solutions
                            </a>
                        </div>
                    </div>
                </div>
                <div class="sector-pattern"></div>
            </section>

            <!-- DIGITAL TRANSFORMATION -->
            <section class="sector-digital">
                <div class="container">
                    <div class="digital-grid">
                        <div class="digital-content">
                            <span class="section-subtitle">Digital Transformation</span>
                            <h2 class="section-title">Future-Ready <span class="text-gold">Enterprise Solutions</span></h2>
                            <p class="digital-text">
                                TAAGC partners with organizations to navigate their digital journey. 
                                From cloud migration to AI-powered analytics, we deliver measurable business outcomes.
                            </p>
                            
                            <div class="digital-pillars">
                                <div class="pillar">
                                    <div class="pillar-icon">
                                        <i class="fas fa-cloud"></i>
                                    </div>
                                    <div>
                                        <h4>Cloud Transformation</h4>
                                        <p>AWS, Azure, Google Cloud certified</p>
                                    </div>
                                </div>
                                <div class="pillar">
                                    <div class="pillar-icon">
                                        <i class="fas fa-robot"></i>
                                    </div>
                                    <div>
                                        <h4>AI & Machine Learning</h4>
                                        <p>Predictive analytics, computer vision</p>
                                    </div>
                                </div>
                                <div class="pillar">
                                    <div class="pillar-icon">
                                        <i class="fas fa-database"></i>
                                    </div>
                                    <div>
                                        <h4>Data Analytics</h4>
                                        <p>Big data, business intelligence</p>
                                    </div>
                                </div>
                                <div class="pillar">
                                    <div class="pillar-icon">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <div>
                                        <h4>Enterprise Applications</h4>
                                        <p>ERP, CRM, custom development</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="digital-image">
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" alt="Digital Transformation">
                            <div class="certification-badge">
                                <i class="fas fa-certificate"></i>
                                <span>AWS Advanced Partner</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SOLUTIONS GRID -->
            <section id="solutions" class="sector-solutions">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Our Solutions</span>
                        <h2 class="section-title">Enterprise-Grade <span class="text-gold">ICT Services</span></h2>
                    </div>

                    <div class="solutions-grid">
                        <div class="solution-card">
                            <div class="solution-header">
                                <i class="fas fa-network-wired"></i>
                                <h3>Infrastructure & Networking</h3>
                            </div>
                            <ul class="solution-list">
                                <li>Enterprise network design & deployment</li>
                                <li>Data center infrastructure</li>
                                <li>SD-WAN implementation</li>
                                <li>WiFi & mobility solutions</li>
                                <li>Network security & monitoring</li>
                            </ul>
                        </div>

                        <div class="solution-card">
                            <div class="solution-header">
                                <i class="fas fa-shield-alt"></i>
                                <h3>Cybersecurity</h3>
                            </div>
                            <ul class="solution-list">
                                <li>Security assessments & audits</li>
                                <li>Managed security services</li>
                                <li>Incident response</li>
                                <li>Compliance & governance</li>
                                <li>Employee security training</li>
                            </ul>
                        </div>

                        <div class="solution-card">
                            <div class="solution-header">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <h3>Cloud Services</h3>
                            </div>
                            <ul class="solution-list">
                                <li>Cloud strategy & migration</li>
                                <li>AWS/Azure/GCP implementation</li>
                                <li>Hybrid cloud solutions</li>
                                <li>Cloud optimization</li>
                                <li>Disaster recovery</li>
                            </ul>
                        </div>

                        <div class="solution-card">
                            <div class="solution-header">
                                <i class="fas fa-code"></i>
                                <h3>Software Development</h3>
                            </div>
                            <ul class="solution-list">
                                <li>Custom enterprise applications</li>
                                <li>Mobile app development</li>
                                <li>API integration</li>
                                <li>Legacy modernization</li>
                                <li>DevOps implementation</li>
                            </ul>
                        </div>

                        <div class="solution-card">
                            <div class="solution-header">
                                <i class="fas fa-chart-pie"></i>
                                <h3>Business Intelligence</h3>
                            </div>
                            <ul class="solution-list">
                                <li>Data warehousing</li>
                                <li>Analytics dashboards</li>
                                <li>Predictive modeling</li>
                                <li>Real-time reporting</li>
                                <li>Data visualization</li>
                            </ul>
                        </div>

                        <div class="solution-card">
                            <div class="solution-header">
                                <i class="fas fa-headset"></i>
                                <h3>IT Consulting</h3>
                            </div>
                            <ul class="solution-list">
                                <li>IT strategy & roadmap</li>
                                <li>Technology assessment</li>
                                <li>Vendor management</li>
                                <li>Digital maturity assessment</li>
                                <li>ROI analysis</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CASE STUDIES -->
            <section class="sector-case-studies">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Success Stories</span>
                        <h2 class="section-title">Digital <span class="text-gold">Transformation</span> in Action</h2>
                    </div>

                    <div class="case-studies-grid">
                        <div class="case-study">
                            <div class="case-study-content">
                                <div class="case-study-header">
                                    <span class="industry">Financial Services</span>
                                    <span class="result">+45% Efficiency</span>
                                </div>
                                <h3>Core Banking Modernization</h3>
                                <p>Migrated legacy banking systems to cloud-native architecture, enabling real-time transactions and reducing operational costs by 35%.</p>
                                <div class="case-study-meta">
                                    <span><i class="fas fa-building"></i> Fortune 500 Bank</span>
                                    <span><i class="fas fa-clock"></i> 18-month project</span>
                                </div>
                            </div>
                        </div>

                        <div class="case-study">
                            <div class="case-study-content">
                                <div class="case-study-header">
                                    <span class="industry">Manufacturing</span>
                                    <span class="result">99.9% Uptime</span>
                                </div>
                                <h3>Industry 4.0 Implementation</h3>
                                <p>Deployed IoT sensors and predictive maintenance system across 12 production facilities, reducing downtime by 60%.</p>
                                <div class="case-study-meta">
                                    <span><i class="fas fa-industry"></i> Global Manufacturer</span>
                                    <span><i class="fas fa-globe"></i> 6 countries</span>
                                </div>
                            </div>
                        </div>

                        <div class="case-study">
                            <div class="case-study-content">
                                <div class="case-study-header">
                                    <span class="industry">Government</span>
                                    <span class="result">2M+ Users</span>
                                </div>
                                <h3>National Digital ID System</h3>
                                <p>Architected and deployed a secure digital identity platform serving over 2 million citizens with biometric authentication.</p>
                                <div class="case-study-meta">
                                    <span><i class="fas fa-government"></i> National Government</span>
                                    <span><i class="fas fa-shield-alt"></i> ISO 27001</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- TECHNOLOGY PARTNERS -->
            <section class="sector-partners">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Technology Partners</span>
                        <h2 class="section-title">Certified <span class="text-gold">Strategic Alliances</span></h2>
                    </div>

                    <div class="partners-grid">
                        <div class="partner-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS">
                        </div>
                        <div class="partner-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" alt="Microsoft Azure">
                        </div>
                        <div class="partner-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Cloud_Logo.svg" alt="Google Cloud">
                        </div>
                        <div class="partner-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5b/Cisco_logo.svg" alt="Cisco">
                        </div>
                        <div class="partner-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Palo_Alto_Networks_logo.svg" alt="Palo Alto">
                        </div>
                        <div class="partner-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/9c/VMware_logo.svg" alt="VMware">
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    init() {
        console.log('ICT sector page initialized');
    }
};

window.SectorICTPage = SectorICTPage;

// pages/sector-agriculture.js
export const SectorAgriculturePage = {
    render() {
        return `
            <!-- HERO SECTION -->
            <section class="sector-hero sector-hero-agriculture">
                <div class="container">
                    <div class="sector-hero-content">
                        <div class="sector-badge">
                            <span class="badge"><i class="fas fa-seedling"></i> CORE SECTOR 01</span>
                        </div>
                        <h1 class="sector-hero-title">Agriculture & <span class="text-gold">Agri-Business</span></h1>
                        <p class="sector-hero-subtitle">
                            Sustainable farming, agri-processing, and supply chain optimization for global food security.
                            From farm to fork, TAAGC delivers institutional-grade agricultural solutions.
                        </p>
                        <div class="sector-hero-stats">
                            <div class="stat-item">
                                <div class="stat-number">15+</div>
                                <div class="stat-label">Countries</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">200K+</div>
                                <div class="stat-label">Hectares</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">$500M+</div>
                                <div class="stat-label">Asset Value</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">40%</div>
                                <div class="stat-label">Efficiency Gain</div>
                            </div>
                        </div>
                        <div class="sector-hero-actions">
                            <a href="/contact" class="btn btn-primary btn-large">
                                <i class="fas fa-handshake"></i> Partner With Us
                            </a>
                            <a href="#investment" class="btn btn-outline">
                                <i class="fas fa-chart-line"></i> Investment Opportunities
                            </a>
                        </div>
                    </div>
                </div>
                <div class="sector-pattern"></div>
            </section>

            <!-- OVERVIEW SECTION -->
            <section class="sector-overview">
                <div class="container">
                    <div class="overview-grid">
                        <div class="overview-content">
                            <span class="section-subtitle">Sector Overview</span>
                            <h2 class="section-title">Transforming <span class="text-gold">Global Agriculture</span></h2>
                            <p class="overview-text">
                                TAAGC's Agriculture sector delivers end-to-end solutions for modern agribusiness. 
                                We combine traditional farming expertise with cutting-edge technology to maximize 
                                yield, ensure sustainability, and create value across the entire agricultural value chain.
                            </p>
                            <div class="overview-features">
                                <div class="feature">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Institutional-grade farming operations</span>
                                </div>
                                <div class="feature">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Sustainable & eco-friendly practices</span>
                                </div>
                                <div class="feature">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Technology-driven precision agriculture</span>
                                </div>
                                <div class="feature">
                                    <i class="fas fa-check-circle"></i>
                                    <span>End-to-end supply chain management</span>
                                </div>
                            </div>
                        </div>
                        <div class="overview-image">
                            <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800" alt="Modern Agriculture" loading="lazy">
                            <div class="image-badge">
                                <i class="fas fa-leaf"></i>
                                <span>Sustainable Practices</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SERVICES GRID -->
            <section class="sector-services">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Our Capabilities</span>
                        <h2 class="section-title">Comprehensive <span class="text-gold">Agricultural Services</span></h2>
                        <p class="section-description">
                            End-to-end solutions covering the entire agricultural value chain
                        </p>
                    </div>

                    <div class="services-grid-large">
                        <!-- Service 1 -->
                        <div class="service-card-large">
                            <div class="service-icon-wrapper">
                                <i class="fas fa-tractor"></i>
                            </div>
                            <h3>Farm Management & Operations</h3>
                            <p>Large-scale commercial farming operations with precision agriculture technology, 
                               optimized irrigation systems, and expert agronomy support.</p>
                            <ul class="service-features">
                                <li><i class="fas fa-check"></i> 50,000+ hectares under management</li>
                                <li><i class="fas fa-check"></i> GPS-guided precision farming</li>
                                <li><i class="fas fa-check"></i> Smart irrigation systems</li>
                                <li><i class="fas fa-check"></i> Crop rotation & soil management</li>
                            </ul>
                        </div>

                        <!-- Service 2 -->
                        <div class="service-card-large">
                            <div class="service-icon-wrapper">
                                <i class="fas fa-industry"></i>
                            </div>
                            <h3>Agri-Processing & Value Addition</h3>
                            <p>State-of-the-art processing facilities for transforming raw agricultural produce 
                               into high-value finished products for domestic and export markets.</p>
                            <ul class="service-features">
                                <li><i class="fas fa-check"></i> Cleaning & grading facilities</li>
                                <li><i class="fas fa-check"></i> Processing & packaging lines</li>
                                <li><i class="fas fa-check"></i> Cold storage & warehousing</li>
                                <li><i class="fas fa-check"></i> Quality control laboratories</li>
                            </ul>
                        </div>

                        <!-- Service 3 -->
                        <div class="service-card-large">
                            <div class="service-icon-wrapper">
                                <i class="fas fa-truck"></i>
                            </div>
                            <h3>Supply Chain & Logistics</h3>
                            <p>Integrated logistics solutions ensuring efficient movement of agricultural 
                               products from farm to market, both domestically and internationally.</p>
                            <ul class="service-features">
                                <li><i class="fas fa-check"></i> Cold chain management</li>
                                <li><i class="fas fa-check"></i> Export logistics & documentation</li>
                                <li><i class="fas fa-check"></i> Warehouse management</li>
                                <li><i class="fas fa-check"></i> Last-mile delivery</li>
                            </ul>
                        </div>

                        <!-- Service 4 -->
                        <div class="service-card-large">
                            <div class="service-icon-wrapper">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <h3>Commodity Trading</h3>
                            <p>Strategic sourcing and trading of agricultural commodities across global markets, 
                               connecting producers with buyers worldwide.</p>
                            <ul class="service-features">
                                <li><i class="fas fa-check"></i> Grains & cereals</li>
                                <li><i class="fas fa-check"></i> Cash crops</li>
                                <li><i class="fas fa-check"></i> Processed foods</li>
                                <li><i class="fas fa-check"></i> Market intelligence</li>
                            </ul>
                        </div>

                        <!-- Service 5 -->
                        <div class="service-card-large">
                            <div class="service-icon-wrapper">
                                <i class="fas fa-flask"></i>
                            </div>
                            <h3>Agricultural Research & Development</h3>
                            <p>Innovation-driven R&D initiatives focused on improving crop yields, 
                               developing drought-resistant varieties, and sustainable farming practices.</p>
                            <ul class="service-features">
                                <li><i class="fas fa-check"></i> Seed technology</li>
                                <li><i class="fas fa-check"></i> Crop protection</li>
                                <li><i class="fas fa-check"></i> Soil science</li>
                                <li><i class="fas fa-check"></i> Yield optimization</li>
                            </ul>
                        </div>

                        <!-- Service 6 -->
                        <div class="service-card-large">
                            <div class="service-icon-wrapper">
                                <i class="fas fa-hand-holding-usd"></i>
                            </div>
                            <h3>Agricultural Finance</h3>
                            <p>Tailored financial solutions for agricultural enterprises, including 
                               project financing, equipment leasing, and working capital support.</p>
                            <ul class="service-features">
                                <li><i class="fas fa-check"></i> Farm project financing</li>
                                <li><i class="fas fa-check"></i> Equipment leasing</li>
                                <li><i class="fas fa-check"></i> Supply chain finance</li>
                                <li><i class="fas fa-check"></i> Export credit</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- INVESTMENT SECTION -->
            <section id="investment" class="sector-investment">
                <div class="container">
                    <div class="investment-grid">
                        <div class="investment-content">
                            <span class="section-subtitle">Investment Opportunities</span>
                            <h2 class="section-title">Partner in <span class="text-gold">Agricultural Growth</span></h2>
                            <p class="investment-text">
                                TAAGC offers vetted investment opportunities in high-potential agricultural 
                                projects across Africa and emerging markets. From commercial farms to 
                                processing facilities, partner with us for sustainable returns.
                            </p>
                            
                            <div class="investment-options">
                                <div class="investment-option">
                                    <div class="option-header">
                                        <span class="option-title">Commercial Farming Projects</span>
                                        <span class="option-roi">ROI: 15-20%</span>
                                    </div>
                                    <p class="option-desc">Large-scale cultivation of cash crops with offtake agreements</p>
                                    <div class="option-meta">
                                        <span><i class="fas fa-clock"></i> 3-5 years</span>
                                        <span><i class="fas fa-dollar-sign"></i> Min. $100,000</span>
                                    </div>
                                </div>
                                
                                <div class="investment-option">
                                    <div class="option-header">
                                        <span class="option-title">Processing Facilities</span>
                                        <span class="option-roi">ROI: 18-25%</span>
                                    </div>
                                    <p class="option-desc">Agri-processing plants for value-added products</p>
                                    <div class="option-meta">
                                        <span><i class="fas fa-clock"></i> 2-4 years</span>
                                        <span><i class="fas fa-dollar-sign"></i> Min. $250,000</span>
                                    </div>
                                </div>
                                
                                <div class="investment-option">
                                    <div class="option-header">
                                        <span class="option-title">Agricultural Infrastructure</span>
                                        <span class="option-roi">ROI: 12-16%</span>
                                    </div>
                                    <p class="option-desc">Cold storage, warehousing, and irrigation systems</p>
                                    <div class="option-meta">
                                        <span><i class="fas fa-clock"></i> 4-7 years</span>
                                        <span><i class="fas fa-dollar-sign"></i> Min. $500,000</span>
                                    </div>
                                </div>
                            </div>
                            
                            <a href="/contact" class="btn btn-primary btn-large">
                                <i class="fas fa-file-alt"></i> Request Investment Memorandum
                            </a>
                        </div>
                        
                        <div class="investment-stats">
                            <div class="stats-card">
                                <h3>Current Opportunities</h3>
                                <div class="stat-list">
                                    <div class="stat-row">
                                        <span>Active Projects:</span>
                                        <strong>12</strong>
                                    </div>
                                    <div class="stat-row">
                                        <span>Total Investment Required:</span>
                                        <strong>$45M</strong>
                                    </div>
                                    <div class="stat-row">
                                        <span>Committed Capital:</span>
                                        <strong>$28M</strong>
                                    </div>
                                    <div class="stat-row highlight">
                                        <span>Available for Investment:</span>
                                        <strong>$17M</strong>
                                    </div>
                                </div>
                                <div class="stats-note">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>All projects are pre-vetted and insured</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- PROJECT SHOWCASE -->
            <section class="sector-projects">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Success Stories</span>
                        <h2 class="section-title">Featured <span class="text-gold">Agricultural Projects</span></h2>
                    </div>

                    <div class="projects-grid">
                        <div class="project-card">
                            <div class="project-image">
                                <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600" alt="Rice Farm Project">
                                <div class="project-tag">Ongoing</div>
                            </div>
                            <div class="project-content">
                                <h3>Mechanized Rice Farm</h3>
                                <p class="project-location"><i class="fas fa-map-marker-alt"></i> Nigeria</p>
                                <p class="project-desc">5,000-hectare integrated rice farm with processing mill</p>
                                <div class="project-metrics">
                                    <div><span>Capacity:</span> 50,000 MT/year</div>
                                    <div><span>Jobs Created:</span> 1,200+</div>
                                </div>
                            </div>
                        </div>

                        <div class="project-card">
                            <div class="project-image">
                                <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600" alt="Cocoa Processing">
                                <div class="project-tag">Completed</div>
                            </div>
                            <div class="project-content">
                                <h3>Cocoa Processing Facility</h3>
                                <p class="project-location"><i class="fas fa-map-marker-alt"></i> Ghana</p>
                                <p class="project-desc">State-of-the-art cocoa processing plant with export capacity</p>
                                <div class="project-metrics">
                                    <div><span>Capacity:</span> 25,000 MT/year</div>
                                    <div><span>ROI:</span> 22%</div>
                                </div>
                            </div>
                        </div>

                        <div class="project-card">
                            <div class="project-image">
                                <img src="https://images.unsplash.com/photo-157494332021

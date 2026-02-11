// pages/sector-grain.js
export const SectorGrainPage = {
    render() {
        return `
            <!-- HERO SECTION -->
            <section class="sector-hero sector-hero-grain">
                <div class="container">
                    <div class="sector-hero-content">
                        <div class="sector-badge">
                            <span class="badge"><i class="fas fa-wheat-alt"></i> CORE SECTOR 02</span>
                        </div>
                        <h1 class="sector-hero-title">Grain Processing & <span class="text-gold">Milling</span></h1>
                        <p class="sector-hero-subtitle">
                            Industrial-scale grain processing, storage, and value-added manufacturing. 
                            From field to flour, TAAGC delivers excellence in grain management.
                        </p>
                        <div class="sector-hero-stats">
                            <div class="stat-item">
                                <div class="stat-number">2M+</div>
                                <div class="stat-label">MT/Year Capacity</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">12</div>
                                <div class="stat-label">Processing Plants</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">500K+</div>
                                <div class="stat-label">MT Storage</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">35%</div>
                                <div class="stat-label">Market Share</div>
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

            <!-- PROCESSING CAPABILITIES -->
            <section class="sector-capabilities">
                <div class="container">
                    <div class="capabilities-grid">
                        <div class="capability-card">
                            <div class="capability-icon">
                                <i class="fas fa-industry"></i>
                            </div>
                            <h3>Wheat Milling</h3>
                            <p>Industrial-scale wheat milling producing high-quality flour for bakeries, pasta manufacturers, and food processors.</p>
                            <ul class="capability-list">
                                <li>500,000 MT annual capacity</li>
                                <li>Premium flour grades</li>
                                <li>Bespoke formulations</li>
                            </ul>
                        </div>
                        
                        <div class="capability-card">
                            <div class="capability-icon">
                                <i class="fas fa-ribbon"></i>
                            </div>
                            <h3>Rice Processing</h3>
                            <p>State-of-the-art rice mills with advanced sorting and polishing technology for premium quality rice.</p>
                            <ul class="capability-list">
                                <li>300,000 MT annual capacity</li>
                                <li>Parboiled & white rice</li>
                                <li>Export grade quality</li>
                            </ul>
                        </div>
                        
                        <div class="capability-card">
                            <div class="capability-icon">
                                <i class="fas fa-corn"></i>
                            </div>
                            <h3>Maize Milling</h3>
                            <p>Comprehensive maize processing for food, feed, and industrial applications.</p>
                            <ul class="capability-list">
                                <li>400,000 MT annual capacity</li>
                                <li>Corn flour & grits</li>
                                <li>Animal feed</li>
                            </ul>
                        </div>
                        
                        <div class="capability-card">
                            <div class="capability-icon">
                                <i class="fas fa-oil-can"></i>
                            </div>
                            <h3>Oilseed Crushing</h3>
                            <p>Advanced oilseed processing for vegetable oils and protein meals.</p>
                            <ul class="capability-list">
                                <li>250,000 MT annual capacity</li>
                                <li>Soybean, sunflower, canola</li>
                                <li>Refined oils & meals</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- STORAGE & LOGISTICS -->
            <section class="sector-storage">
                <div class="container">
                    <div class="storage-grid">
                        <div class="storage-content">
                            <span class="section-subtitle">Infrastructure</span>
                            <h2 class="section-title">Strategic <span class="text-gold">Grain Storage</span> Network</h2>
                            <p class="storage-text">
                                TAAGC operates one of the largest grain storage networks in Africa, 
                                with strategic locations near major production areas and port facilities.
                            </p>
                            
                            <div class="storage-features">
                                <div class="storage-feature">
                                    <i class="fas fa-warehouse"></i>
                                    <div>
                                        <h4>Silo Complexes</h4>
                                        <p>12 locations with 500,000 MT capacity</p>
                                    </div>
                                </div>
                                <div class="storage-feature">
                                    <i class="fas fa-snowflake"></i>
                                    <div>
                                        <h4>Climate-Controlled</h4>
                                        <p>Temperature and humidity monitoring</p>
                                    </div>
                                </div>
                                <div class="storage-feature">
                                    <i class="fas fa-search"></i>
                                    <div>
                                        <h4>Quality Control</h4>
                                        <p>In-house laboratory testing</p>
                                    </div>
                                </div>
                                <div class="storage-feature">
                                    <i class="fas fa-train"></i>
                                    <div>
                                        <h4>Multi-Modal Logistics</h4>
                                        <p>Rail, truck, and port access</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="storage-map">
                            <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800" alt="Grain Storage Facility">
                            <div class="map-badge">
                                <span>500K+ MT</span>
                                <p>Total Storage Capacity</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- VALUE ADDED PRODUCTS -->
            <section class="sector-products">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Product Portfolio</span>
                        <h2 class="section-title">Value-Added <span class="text-gold">Grain Products</span></h2>
                    </div>

                    <div class="products-grid">
                        <div class="product-category">
                            <h3>Flour & Bakery</h3>
                            <ul>
                                <li>Bread flour (high protein)</li>
                                <li>Pastry flour</li>
                                <li>Whole wheat flour</li>
                                <li>Self-rising flour</li>
                                <li>Pasta semolina</li>
                            </ul>
                        </div>
                        
                        <div class="product-category">
                            <h3>Rice Products</h3>
                            <ul>
                                <li>Parboiled rice</li>
                                <li>Premium white rice</li>
                                <li>Brown rice</li>
                                <li>Rice flour</li>
                                <li>Broken rice (industrial)</li>
                            </ul>
                        </div>
                        
                        <div class="product-category">
                            <h3>Maize Products</h3>
                            <ul>
                                <li>Corn flour</li>
                                <li>Maize grits</li>
                                <li>Corn meal</li>
                                <li>Animal feed</li>
                                <li>Industrial starch</li>
                            </ul>
                        </div>
                        
                        <div class="product-category">
                            <h3>Oils & Meals</h3>
                            <ul>
                                <li>Refined vegetable oil</li>
                                <li>Soybean meal</li>
                                <li>Sunflower meal</li>
                                <li>Canola meal</li>
                                <li>Crude degummed oil</li>
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
                            <h2 class="section-title">Grain Processing <span class="text-gold">Partnerships</span></h2>
                            <p class="investment-text">
                                Partner with TAAGC to expand grain processing capacity across Africa. 
                                We offer structured investment opportunities in new mills, storage facilities, 
                                and value-added processing lines.
                            </p>
                            
                            <div class="investment-options">
                                <div class="investment-option">
                                    <div class="option-header">
                                        <span class="option-title">Greenfield Mill Projects</span>
                                        <span class="option-roi">ROI: 18-24%</span>
                                    </div>
                                    <p class="option-desc">New grain milling facilities in strategic locations</p>
                                    <div class="option-meta">
                                        <span><i class="fas fa-clock"></i> 3-4 years</span>
                                        <span><i class="fas fa-dollar-sign"></i> Min. $500,000</span>
                                    </div>
                                </div>
                                
                                <div class="investment-option">
                                    <div class="option-header">
                                        <span class="option-title">Storage Expansion</span>
                                        <span class="option-roi">ROI: 14-18%</span>
                                    </div>
                                    <p class="option-desc">Silo complexes and warehouse facilities</p>
                                    <div class="option-meta">
                                        <span><i class="fas fa-clock"></i> 2-3 years</span>
                                        <span><i class="fas fa-dollar-sign"></i> Min. $250,000</span>
                                    </div>
                                </div>
                                
                                <div class="investment-option">
                                    <div class="option-header">
                                        <span class="option-title">Value-Add Processing</span>
                                        <span class="option-roi">ROI: 20-26%</span>
                                    </div>
                                    <p class="option-desc">Specialty flour, fortified foods, and industrial ingredients</p>
                                    <div class="option-meta">
                                        <span><i class="fas fa-clock"></i> 2-4 years</span>
                                        <span><i class="fas fa-dollar-sign"></i> Min. $300,000</span>
                                    </div>
                                </div>
                            </div>
                            
                            <a href="/contact" class="btn btn-primary btn-large">
                                <i class="fas fa-file-alt"></i> Request Investment Memorandum
                            </a>
                        </div>
                        
                        <div class="investment-stats">
                            <div class="stats-card">
                                <h3>Sector Performance</h3>
                                <div class="stat-list">
                                    <div class="stat-row">
                                        <span>Annual Production:</span>
                                        <strong>2.1M MT</strong>
                                    </div>
                                    <div class="stat-row">
                                        <span>Revenue (2023):</span>
                                        <strong>$420M</strong>
                                    </div>
                                    <div class="stat-row">
                                        <span>Growth Rate:</span>
                                        <strong>+24%</strong>
                                    </div>
                                    <div class="stat-row">
                                        <span>Export Markets:</span>
                                        <strong>18</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    init() {
        console.log('Grain processing sector page initialized');
    }
};

window.SectorGrainPage = SectorGrainPage;

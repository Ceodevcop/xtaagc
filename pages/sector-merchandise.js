// pages/sector-merchandise.js
export const SectorMerchandisePage = {
    render() {
        return `
            <!-- HERO SECTION -->
            <section class="sector-hero sector-hero-merchandise">
                <div class="container">
                    <div class="sector-hero-content">
                        <div class="sector-badge">
                            <span class="badge"><i class="fas fa-box"></i> CORE SECTOR 05</span>
                        </div>
                        <h1 class="sector-hero-title">General Merchandise & <span class="text-gold">Global Trade</span></h1>
                        <p class="sector-hero-subtitle">
                            Global procurement, logistics, and supply chain solutions for consumer goods, 
                            industrial products, and specialized merchandise. Your bridge to global markets.
                        </p>
                        <div class="sector-hero-stats">
                            <div class="stat-item">
                                <div class="stat-number">10K+</div>
                                <div class="stat-label">Products</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">35</div>
                                <div class="stat-label">Sourcing Countries</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">50K+</div>
                                <div class="stat-label">Shipments/Year</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">99%</div>
                                <div class="stat-label">Client Satisfaction</div>
                            </div>
                        </div>
                        <div class="sector-hero-actions">
                            <a href="/contact" class="btn btn-primary btn-large">
                                <i class="fas fa-handshake"></i> Start Sourcing
                            </a>
                            <a href="#shopping" class="btn btn-outline">
                                <i class="fas fa-shopping-cart"></i> Personal Shopping
                            </a>
                        </div>
                    </div>
                </div>
                <div class="sector-pattern"></div>
            </section>

            <!-- SHOPPING CONCIERGE -->
            <section id="shopping" class="sector-shopping-concierge">
                <div class="container">
                    <div class="shopping-grid">
                        <div class="shopping-content">
                            <span class="section-subtitle">Personal Shopping Concierge</span>
                            <h2 class="section-title">Shop Anywhere in the <span class="text-gold">World</span></h2>
                            <p class="shopping-text">
                                Can't ship to your country? TAAGC's personal shopping service gives you access 
                                to Amazon, Walmart, eBay, and thousands of other retailers worldwide. 
                                We buy, consolidate, and ship directly to your doorstep.
                            </p>
                            
                            <div class="shopping-platforms">
                                <div class="platform">
                                    <i class="fab fa-amazon"></i>
                                    <span>Amazon</span>
                                </div>
                                <div class="platform">
                                    <i class="fab fa-walmart"></i>
                                    <span>Walmart</span>
                                </div>
                                <div class="platform">
                                    <i class="fab fa-ebay"></i>
                                    <span>eBay</span>
                                </div>
                                <div class="platform">
                                    <i class="fas fa-store"></i>
                                    <span>Wish</span>
                                </div>
                                <div class="platform">
                                    <i class="fas fa-shopping-bag"></i>
                                    <span>Alibaba</span>
                                </div>
                                <div class="platform">
                                    <i class="fas fa-tshirt"></i>
                                    <span>Fashion Retailers</span>
                                </div>
                            </div>
                            
                            <div class="shopping-process">
                                <h3>How It Works</h3>
                                <div class="process-steps-horizontal">
                                    <div class="process-step-item">
                                        <div class="step-number">1</div>
                                        <h4>Find Item</h4>
                                        <p>Send us the product link</p>
                                    </div>
                                    <div class="process-step-item">
                                        <div class="step-number">2</div>
                                        <h4>Get Quote</h4>
                                        <p>All-inclusive price</p>
                                    </div>
                                    <div class="process-step-item">
                                        <div class="step-number">3</div>
                                        <h4>We Purchase</h4>
                                        <p>Secure payment processing</p>
                                    </div>
                                    <div class="process-step-item">
                                        <div class="step-number">4</div>
                                        <h4>Ship to You</h4>
                                        <p>Doorstep delivery</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="shopping-cta">
                                <a href="/contact" class="btn btn-primary btn-large">
                                    <i class="fas fa-calculator"></i> Get Instant Quote
                                </a>
                                <a href="#" class="btn btn-outline-primary">
                                    <i class="fas fa-download"></i> Shopping Guide
                                </a>
                            </div>
                        </div>
                        
                        <div class="shopping-calculator">
                            <div class="calculator-card">
                                <h3><i class="fas fa-calculator"></i> Shipping Calculator</h3>
                                <form id="shippingCalculator" class="calculator-form">
                                    <div class="form-group">
                                        <label>Product URL</label>
                                        <input type="url" placeholder="https://amazon.com/..." id="productUrl">
                                    </div>
                                    <div class="form-group">
                                        <label>Estimated Value ($)</label>
                                        <input type="number" placeholder="100" id="productValue">
                                    </div>
                                    <div class="form-group">
                                        <label>Weight (kg)</label>
                                        <input type="number" placeholder="2" id="productWeight">
                                    </div>
                                    <div class="form-group">
                                        <label>Destination</label>
                                        <select id="destination">
                                            <option value="">Select country</option>
                                            <option value="nigeria">Nigeria</option>
                                            <option value="ghana">Ghana</option>
                                            <option value="kenya">Kenya</option>
                                            <option value="south-africa">South Africa</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <button type="button" class="btn btn-primary btn-full" id="calculateBtn">
                                        Calculate Total Cost
                                    </button>
                                </form>
                                
                                <div id="calculationResult" class="calculation-result" style="display: none;">
                                    <h4>Estimated Total:</h4>
                                    <div class="cost-breakdown">
                                        <div class="cost-row">
                                            <span>Product Cost:</span>
                                            <span id="costProduct">$0.00</span>
                                        </div>
                                        <div class="cost-row">
                                            <span>Shipping:</span>
                                            <span id="costShipping">$0.00</span>
                                        </div>
                                        <div class="cost-row">
                                            <span>Customs & Duties:</span>
                                            <span id="costDuties">$0.00</span>
                                        </div>
                                        <div class="cost-row">
                                            <span>Service Fee (10%):</span>
                                            <span id="costFee">$0.00</span>
                                        </div>
                                        <div class="cost-row total">
                                            <span>Total:</span>
                                            <span id="costTotal">$0.00</span>
                                        </div>
                                    </div>
                                    <button class="btn btn-primary btn-full">Proceed to Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- PRODUCT CATEGORIES -->
            <section class="sector-product-categories">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Product Categories</span>
                        <h2 class="section-title">Global Sourcing <span class="text-gold">Specialties</span></h2>
                    </div>

                    <div class="categories-grid">
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-mobile-alt"></i>
                            </div>
                            <h3>Electronics</h3>
                            <p>Smartphones, laptops, accessories, home appliances</p>
                            <span class="category-source">USA, China, Japan</span>
                        </div>
                        
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-tshirt"></i>
                            </div>
                            <h3>Fashion</h3>
                            <p>Clothing, footwear, accessories, luxury goods</p>
                            <span class="category-source">Italy, France, USA</span>
                        </div>
                        
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-car"></i>
                            </div>
                            <h3>Automotive</h3>
                            <p>Spare parts, accessories, tools, equipment</p>
                            <span class="category-source">Germany, Japan, USA</span>
                        </div>
                        
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-heartbeat"></i>
                            </div>
                            <h3>Health & Beauty</h3>
                            <p>Cosmetics, supplements, medical supplies</p>
                            <span class="category-source">Korea, USA, France</span>
                        </div>
                        
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-couch"></i>
                            </div>
                            <h3>Home & Living</h3>
                            <p>Furniture, decor, kitchenware, appliances</p>
                            <span class="category-source">Global</span>
                        </div>
                        
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-futbol"></i>
                            </div>
                            <h3>Sports & Outdoors</h3>
                            <p>Equipment, apparel, camping gear, fitness</p>
                            <span class="category-source">USA, Europe</span>
                        </div>
                        
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-baby"></i>
                            </div>
                            <h3>Baby & Kids</h3>
                            <p>Toys, clothing, gear, nursery items</p>
                            <span class="category-source">Global</span>
                        </div>
                        
                        <div class="category-card">
                            <div class="category-icon">
                                <i class="fas fa-toolbox"></i>
                            </div>
                            <h3>Industrial</h3>
                            <p>Tools, machinery, safety equipment, supplies</p>
                            <span class="category-source">China, Germany, USA</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- B2B PROCUREMENT -->
            <section class="sector-b2b">
                <div class="container">
                    <div class="b2b-grid">
                        <div class="b2b-content">
                            <span class="section-subtitle">Business Procurement</span>
                            <h2 class="section-title">Enterprise <span class="text-gold">Supply Chain</span> Solutions</h2>
                            <p class="b2b-text">
                                TAAGC provides comprehensive procurement services for businesses of all sizes. 
                                From office supplies to raw materials, we leverage global supplier networks 
                                to deliver cost savings and operational efficiency.
                            </p>
                            
                            <div class="b2b-features">
                                <div class="b2b-feature">
                                    <i class="fas fa-check-circle"></i>
                                    <div>
                                        <h4>Strategic Sourcing</h4>
                                        <p>Supplier identification, negotiation, and contract management</p>
                                    </div>
                                </div>
                                <div class="b2b-feature">
                                    <i class="fas fa-check-circle"></i>
                                    <div>
                                        <h4>Bulk Procurement</h4>
                                        <p>Volume discounts and consolidated shipping</p>
                                    </div>
                                </div>
                                <div class="b2b-feature">
                                    <i class="fas fa-check-circle"></i>
                                    <div>
                                        <h4>Inventory Management</h4>
                                        <p>Warehousing, stock control, just-in-time delivery</p>
                                    </div>
                                </div>
                            </div>
                            
                            <a href="/contact" class="btn btn-primary">Request Procurement Consultation</a>
                        </div>
                        
                        <div class="b2b-stats">
                            <div class="b2b-stat-card">
                                <div class="stat-value">25-40%</div>
                                <div class="stat-desc">Average Cost Savings</div>
                            </div>
                            <div class="b2b-stat-card">
                                <div class="stat-value">15,000+</div>
                                <div class="stat-desc">SKUs Managed</div>
                            </div>
                            <div class="b2b-stat-card">
                                <div class="stat-value">48h</div>
                                <div class="stat-desc">Quote Turnaround</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- TRADE FINANCE -->
            <section class="sector-trade-finance">
                <div class="container">
                    <div class="trade-finance-card">
                        <div class="trade-finance-content">
                            <span class="section-subtitle">Trade Finance</span>
                            <h2 class="section-title">Flexible <span class="text-gold">Payment Solutions</span></h2>
                            <p class="trade-finance-text">
                                TAAGC offers integrated trade finance solutions to facilitate international 
                                commerce. We bridge the gap between suppliers and buyers with flexible 
                                payment terms and risk mitigation.
                            </p>
                            
                            <div class="finance-options">
                                <div class="finance-option">
                                    <i class="fas fa-file-invoice-dollar"></i>
                                    <h4>Letters of Credit</h4>
                                    <p>Secure payment processing</p>
                                </div>
                                <div class="finance-option">
                                    <i class="fas fa-hand-holding-usd"></i>
                                    <h4>Supplier Financing</h4>
                                    <p>Extended payment terms</p>
        

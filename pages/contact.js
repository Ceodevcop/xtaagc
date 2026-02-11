// pages/contact.js
export const ContactPage = {
    render() {
        return `
            <section id="contact" class="contact-section">
                <div class="container">
                    <div class="contact-header">
                        <span class="section-subtitle">Connect With Our Team</span>
                        <h2 class="section-title">Ready to discuss how TAAGC can support your <span class="text-gold">global objectives?</span></h2>
                        <p class="contact-description">
                            Contact our strategic partnerships team for a confidential consultation.
                        </p>
                    </div>
                    
                    <div class="contact-grid">
                        <!-- Global Headquarters -->
                        <div class="contact-card">
                            <div class="contact-icon-wrapper"><i class="fas fa-building"></i></div>
                            <h3>Global Headquarters</h3>
                            <p class="contact-detail">123 Financial District</p>
                            <p class="contact-detail">Global Business Hub</p>
                        </div>
                        
                        <!-- Phone Contact -->
                        <div class="contact-card">
                            <div class="contact-icon-wrapper"><i class="fas fa-phone-alt"></i></div>
                            <h3>Phone</h3>
                            <p class="contact-detail-large"><a href="tel:+15551234567">+1 (555) 123-4567</a></p>
                            <p class="contact-note">24/7 Executive Line</p>
                        </div>
                        
                        <!-- Email Contact -->
                        <div class="contact-card">
                            <div class="contact-icon-wrapper"><i class="fas fa-envelope"></i></div>
                            <h3>Email</h3>
                            <p class="contact-detail-large"><a href="mailto:partnerships@taagc.com">partnerships@taagc.com</a></p>
                            <p class="contact-note">Response within 24 hours</p>
                        </div>
                        
                        <!-- Business Hours -->
                        <div class="contact-card">
                            <div class="contact-icon-wrapper"><i class="fas fa-clock"></i></div>
                            <h3>Business Hours</h3>
                            <p class="contact-detail">Monday - Friday</p>
                            <p class="contact-detail">9:00 AM - 6:00 PM GMT</p>
                        </div>
                    </div>
                    
                    <!-- Investment Inquiry Form -->
                    <div class="contact-form-container">
                        <h3 class="form-title">Investment & Partnership Inquiry</h3>
                        <form id="contactForm" class="contact-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="name">Full Name</label>
                                    <input type="text" id="name" placeholder="Your full name" required>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email Address</label>
                                    <input type="email" id="email" placeholder="you@company.com" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="company">Company / Organization</label>
                                    <input type="text" id="company" placeholder="Company name">
                                </div>
                                <div class="form-group">
                                    <label for="inquiryType">Inquiry Type</label>
                                    <select id="inquiryType">
                                        <option value="">Select one</option>
                                        <option value="investment">Investment Opportunity</option>
                                        <option value="shopping">Global Merchandise</option>
                                        <option value="partnership">Strategic Partnership</option>
                                        <option value="services">Business Services</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group full-width">
                                <label for="message">Message / Investment Amount</label>
                                <textarea id="message" rows="5" placeholder="Tell us about your objectives, investment amount, or specific requirements..."></textarea>
                            </div>
                            <div class="form-submit">
                                <button type="submit" class="btn btn-primary btn-large">
                                    <i class="fas fa-paper-plane"></i> Submit Inquiry
                                </button>
                                <p class="form-disclaimer">
                                    <i class="fas fa-lock"></i> Your information is secure and confidential
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
            
            <!-- CEO Message Preview -->
            <section class="ceo-preview-section">
                <div class="container">
                    <div class="ceo-preview-card">
                        <div class="ceo-preview-content">
                            <span class="quote-mark"><i class="fas fa-quote-right"></i></span>
                            <h3>Leadership with Purpose</h3>
                            <p>"My mission is to break down walls and build bridges to the global marketplace."</p>
                            <div class="ceo-preview-footer">
                                <div>
                                    <h4>Ahmad Hamza</h4>
                                    <p>CEO, Triple A AHAL Global Concept</p>
                                </div>
                                <a href="/ceo" class="btn btn-outline">Read Full Message <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    init() {
        console.log('Contact page initialized');
        
        // Initialize contact form
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                btn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        form.reset();
                    }, 2000);
                }, 1500);
            });
        }
    }
};

window.ContactPage = ContactPage;

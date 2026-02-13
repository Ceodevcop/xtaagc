// sections/contact.js
export default {
    render() {
        return `
            <section id="contact" class="contact-section">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Connect With Our Team</span>
                        <h2 class="section-title">Ready to discuss your <span class="text-gold">global objectives?</span></h2>
                        <p class="section-description">
                            Contact our strategic partnerships team for a confidential consultation.
                        </p>
                    </div>
                    
                    <div class="contact-grid">
                        <div class="contact-card">
                            <div class="contact-icon"><i class="fas fa-building"></i></div>
                            <h3>Global Headquarters</h3>
                            <p class="contact-detail">123 Financial District<br>Global Business Hub</p>
                        </div>
                        <div class="contact-card">
                            <div class="contact-icon"><i class="fas fa-phone-alt"></i></div>
                            <h3>Phone</h3>
                            <p class="contact-phone">+1 (555) 123-4567</p>
                            <p class="contact-note" style="font-size:13px; color:#64748b;">24/7 Executive Line</p>
                        </div>
                        <div class="contact-card">
                            <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                            <h3>Email</h3>
                            <p class="contact-email">partnerships@taagc.com</p>
                            <p class="contact-note" style="font-size:13px; color:#64748b;">Response within 24 hours</p>
                        </div>
                        <div class="contact-card">
                            <div class="contact-icon"><i class="fas fa-clock"></i></div>
                            <h3>Business Hours</h3>
                            <p class="contact-detail">Monday - Friday<br>9:00 AM - 6:00 PM GMT</p>
                        </div>
                    </div>
                    
                    <div class="contact-form-container">
                        <h3 class="form-title">Send Us a Message</h3>
                        <form id="contactForm">
                            <div class="form-row">
                                <input type="text" class="form-control" placeholder="Your Name" required>
                                <input type="email" class="form-control" placeholder="Your Email" required>
                            </div>
                            <div class="form-row">
                                <input type="text" class="form-control" placeholder="Company">
                                <select class="form-control">
                                    <option value="">Select Sector</option>
                                    <option value="agriculture">Agriculture</option>
                                    <option value="grain">Grain Processing</option>
                                    <option value="ict">ICT</option>
                                    <option value="contracts">General Contracts</option>
                                    <option value="merchandise">General Merchandise</option>
                                    <option value="investment">Investment</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <textarea class="form-control" rows="5" placeholder="Your Message" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block btn-lg">
                                <i class="fas fa-paper-plane"></i> Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        `;
    },
    
    init() {
        document.getElementById('contactForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;
            
            setTimeout(() => {
                Notifications.success('Message sent successfully! We\'ll get back to you soon.');
                this.reset();
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                btn.disabled = false;
            }, 1500);
        });
    }
};

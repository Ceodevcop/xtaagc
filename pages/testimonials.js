// pages/testimonials.js
export const TestimonialsPage = {
    render() {
        return `
            <section id="testimonials" class="testimonials-section">
                <div class="container">
                    <div class="section-header">
                        <span class="section-subtitle">Partner Perspectives</span>
                        <h2 class="section-title">Trusted by <span class="text-gold">Global Leaders</span></h2>
                        <p class="section-description">
                            Hear from global partners about their experience working with TAAGC.
                        </p>
                    </div>
                    
                    <div class="testimonials-grid">
                        <!-- Testimonial 1 -->
                        <div class="testimonial-card">
                            <div class="testimonial-quote"><i class="fas fa-quote-left"></i></div>
                            <div class="testimonial-content">
                                <p>"TAAGC transformed our agricultural operations with institutional-grade precision 
                                and strategic insight. Their integrated approach to supply chain optimization 
                                resulted in a <strong>40% efficiency improvement</strong>."</p>
                            </div>
                            <div class="testimonial-author">
                                <div class="author-avatar"><span>MR</span></div>
                                <div class="author-info">
                                    <h4>Michael Rodriguez</h4>
                                    <p>COO, Global Agribusiness Inc.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Testimonial 2 -->
                        <div class="testimonial-card">
                            <div class="testimonial-quote"><i class="fas fa-quote-left"></i></div>
                            <div class="testimonial-content">
                                <p>"The ICT infrastructure deployed by TAAGC has positioned us for digital leadership 
                                in our sector. Their enterprise-grade solutions delivered <strong>measurable ROI</strong> 
                                within the first fiscal year."</p>
                            </div>
                            <div class="testimonial-author">
                                <div class="author-avatar"><span>SC</span></div>
                                <div class="author-info">
                                    <h4>Sarah Chen</h4>
                                    <p>CTO, Fortune 500 Technology Firm</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Testimonial 3 -->
                        <div class="testimonial-card">
                            <div class="testimonial-quote"><i class="fas fa-quote-left"></i></div>
                            <div class="testimonial-content">
                                <p>"As a strategic partner, TAAGC's general merchandise procurement capabilities 
                                opened new markets for us. Their logistics network across Africa and the Middle 
                                East is unparalleled."</p>
                            </div>
                            <div class="testimonial-author">
                                <div class="author-avatar"><span>AK</span></div>
                                <div class="author-info">
                                    <h4>Amara Kone</h4>
                                    <p>Supply Chain Director, Pan-African Retail Group</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="testimonials-cta">
                        <a href="/ceo" class="btn btn-outline-primary">
                            <i class="fas fa-user-tie"></i> Message from Our CEO
                        </a>
                    </div>
                </div>
            </section>
        `;
    },
    
    init() {
        console.log('Testimonials page initialized');
    }
};

window.TestimonialsPage = TestimonialsPage;

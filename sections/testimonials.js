// sections/testimonials.js
export default {
    render() {
        const testimonials = [
            { initials: 'MR', name: 'Michael Rodriguez', role: 'COO, Global Agribusiness Inc.', quote: 'TAAGC transformed our agricultural operations with institutional-grade precision and strategic insight. Their integrated approach to supply chain optimization resulted in a <strong>40% efficiency improvement</strong>.' },
            { initials: 'SC', name: 'Sarah Chen', role: 'CTO, Fortune 500 Technology Firm', quote: 'The ICT infrastructure deployed by TAAGC has positioned us for digital leadership in our sector. Their enterprise-grade solutions delivered <strong>measurable ROI</strong> within the first fiscal year.' },
            { initials: 'AK', name: 'Amara Kone', role: 'Supply Chain Director, Pan-African Retail Group', quote: 'TAAGC\'s general merchandise procurement capabilities opened new markets for us. Their logistics network across Africa and the Middle East is unparalleled.' }
        ];
        
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
                        ${testimonials.map(t => `
                            <div class="testimonial-card">
                                <div class="testimonial-quote"><i class="fas fa-quote-left"></i></div>
                                <div class="testimonial-content">
                                    <p>${t.quote}</p>
                                </div>
                                <div class="testimonial-author">
                                    <div class="author-avatar">${t.initials}</div>
                                    <div class="author-info">
                                        <h4>${t.name}</h4>
                                        <p>${t.role}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }
};

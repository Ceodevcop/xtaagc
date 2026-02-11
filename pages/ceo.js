// pages/ceo.js
export const CeoPage = {
    render() {
        return `
            <section class="ceo-full-section">
                <div class="container">
                    <div class="ceo-full-card">
                        <div class="ceo-full-grid">
                            <div class="ceo-full-content">
                                <div class="ceo-badge">
                                    <span class="badge"><i class="fas fa-crown"></i> FOUNDER & CHIEF EXECUTIVE</span>
                                </div>
                                
                                <h1 class="ceo-full-title">Ahmad Hamza</h1>
                                <p class="ceo-full-subtitle">Leading Global Integration with Purpose</p>
                                
                                <div class="ceo-full-message">
                                    <div class="ceo-full-quote">
                                        <i class="fas fa-quote-left"></i>
                                    </div>
                                    
                                    <p class="ceo-message-text">
                                        I understand the frustration of seeing a product online you cannot buy, 
                                        or an investment opportunity you cannot access due to geographic and 
                                        logistical barriers. My mission is to break down these walls.
                                    </p>
                                    
                                    <p class="ceo-message-text">
                                        We built TAAGC to be your reliable bridge to the global marketplace. 
                                        With transparency as our standard and your satisfaction as our metric, 
                                        my team and I personally ensure every transaction—whether a single purchase 
                                        or a major investment—meets the Triple A standard of 
                                        <span class="highlight">Accountability, Agility, and Access</span>.
                                    </p>
                                    
                                    <p class="ceo-message-text">
                                        Today, TAAGC operates across 50+ countries with over 500 global partners. 
                                        We have grown from a vision into an institutional-grade partner for 
                                        Fortune 500 companies, governments, and enterprises worldwide. Yet our 
                                        mission remains the same: to democratize access to global markets and 
                                        create sustainable value for every partner we serve.
                                    </p>
                                    
                                    <p class="ceo-message-signature">
                                        With integrity and determination,<br>
                                        <strong>Ahmad Hamza</strong><br>
                                        <span class="ceo-title">Chief Executive Officer</span>
                                    </p>
                                </div>
                                
                                <div class="ceo-contact-info">
                                    <div class="ceo-contact-item">
                                        <i class="fas fa-envelope"></i>
                                        <a href="mailto:priahmz@gmail.com">priahmz@gmail.com</a>
                                    </div>
                                    <div class="ceo-contact-item">
                                        <i class="fas fa-phone-alt"></i>
                                        <a href="tel:+2348023566143">+234 802 356 6143</a>
                                    </div>
                                    <div class="ceo-contact-item">
                                        <i class="fas fa-globe"></i>
                                        <span>taagc.website</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="ceo-full-image">
                                <div class="ceo-image-wrapper">
                                    <div class="ceo-initials-large">
                                        <span>AH</span>
                                    </div>
                                    <div class="ceo-signature">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Signature-black-2.svg/1200px-Signature-black-2.svg.png" alt="Ahmad Hamza Signature">
                                    </div>
                                    <div class="ceo-award-badge">
                                        <i class="fas fa-medal"></i>
                                        <span>Triple A Leadership</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Call to Action -->
            <section class="ceo-cta-section">
                <div class="container">
                    <div class="ceo-cta-card">
                        <h2>Ready to Partner with TAAGC?</h2>
                        <p>Direct access to executive leadership. No barriers. No delays.</p>
                        <div class="ceo-cta-buttons">
                            <a href="/contact" class="btn btn-primary btn-large">
                                <i class="fas fa-handshake"></i> Schedule Executive Call
                            </a>
                            <a href="/sectors" class="btn btn-outline btn-large">
                                <i class="fas fa-cubes"></i> Explore Our Sectors
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    init() {
        console.log('CEO page initialized');
    }
};

window.CeoPage = CeoPage;

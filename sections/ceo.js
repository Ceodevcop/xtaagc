// sections/ceo.js
export default {
    render() {
        return `
            <section id="ceo" class="ceo-section">
                <div class="container">
                    <div class="ceo-card">
                        <div class="ceo-content">
                            <span class="ceo-quote-mark"><i class="fas fa-quote-right"></i></span>
                            <h2>Message from the <span class="text-gold">CEO</span></h2>
                            <p class="ceo-message">
                                "I understand the frustration of seeing a product online you cannot buy, or an investment 
                                opportunity you cannot access due to geographic and logistical barriers. My mission is to 
                                break down these walls. We built TAAGC to be your reliable bridge to the global marketplace. 
                                With transparency as our standard and your satisfaction as our metric, my team and I 
                                personally ensure every transaction meets the Triple A standard of 
                                <strong>Accountability, Agility, and Access</strong>."
                            </p>
                            <div class="ceo-signature">
                                <h3>Ahmad Hamza</h3>
                                <p>Chief Executive Officer</p>
                                <p class="ceo-contact"><i class="fas fa-envelope"></i> priahmz@gmail.com</p>
                            </div>
                        </div>
                        <div class="ceo-image">
                            <div class="ceo-initials">AH</div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
};

// components/footer.js
export const Footer = {
    render() {
        return `
            <footer class="footer">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <a href="/" class="footer-logo">
                                <span>TAAGC</span> GLOBAL
                            </a>
                            <p class="footer-description">
                                Triple A AHAL Global Concept delivers institutional-grade solutions across 
                                five core sectors, connecting global markets with precision and integrity.
                            </p>
                            <div class="footer-social">
                                <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                                <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>
                        
                        <div class="footer-links">
                            <h4>Our Sectors</h4>
                            <ul>
                                <li><a href="/sectors#agriculture">Agriculture</a></li>
                                <li><a href="/sectors#grain">Grain Processing</a></li>
                                <li><a href="/sectors#ict">ICT</a></li>
                                <li><a href="/sectors#contracts">General Contracts</a></li>
                                <li><a href="/sectors#merchandise">General Merchandise</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-links">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="/ceo">CEO Message</a></li>
                                <li><a href="/approach">Our Approach</a></li>
                                <li><a href="/testimonials">Partners</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">News</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-links">
                            <h4>Contact</h4>
                            <ul class="footer-contact">
                                <li><i class="fas fa-map-marker-alt"></i> Global Business Hub</li>
                                <li><i class="fas fa-phone"></i> +1 (555) 123-4567</li>
                                <li><i class="fas fa-envelope"></i> partnerships@taagc.com</li>
                                <li><i class="fas fa-clock"></i> Mon-Fri, 9AM-6PM GMT</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <div class="footer-legal">
                            <p>&copy; 2024 Triple A AHAL Global Concept (TAAGC). All rights reserved.</p>
                            <div class="legal-links">
                                <a href="#">Privacy</a>
                                <a href="#">Terms</a>
                                <a href="#">Cookies</a>
                            </div>
                        </div>
                        <p class="footer-credit">
                            Designed for <i class="fas fa-globe"></i> global excellence
                        </p>
                    </div>
                </div>
            </footer>
        `;
    },
    
    init() {
        console.log('Footer initialized');
    }
};

// Render footer on load
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('footer-container');
    if (container) {
        container.innerHTML = Footer.render();
        Footer.init();
    }
});

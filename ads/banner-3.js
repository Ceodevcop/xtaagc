// ads/banner-3.js
export default {
    id: 'banner-3',
    title: 'Join Our Leadership Board',
    subtitle: 'Connect with top industry leaders',
    cta: 'Register Now',
    link: '/leadership-register.html',
    
    render() {
        return this.renderPopup(); // Use same for banner
    },
    
    renderPopup() {
        return `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; font-size: 32px;">
                    <i class="fas fa-crown"></i>
                </div>
                <h2 style="color: var(--primary); margin-bottom: 10px;">${this.title}</h2>
                <p style="color: #4a5568; margin-bottom: 20px;">${this.subtitle}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <a href="${this.link}" class="btn btn-primary" onclick="adManager.trackClick('${this.id}', '${this.link}')">
                        ${this.cta} <i class="fas fa-arrow-right"></i>
                    </a>
                    <button class="btn btn-outline" onclick="this.closest('.modal').classList.remove('active')">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;
    },
    
    init() {
        adManager.trackImpression(this.id);
    }
};

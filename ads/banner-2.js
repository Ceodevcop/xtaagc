// ads/banner-2.js
export default {
    id: 'banner-2',
    title: 'Investment Opportunities',
    subtitle: 'High ROI projects in agriculture and technology',
    cta: 'Invest Now',
    link: '/investor-dashboard.html',
    
    render() {
        return `
            <div class="ad-content" style="background: linear-gradient(135deg, #2d5a4a, #1e3a3a); padding: 40px; border-radius: 16px; margin: 20px auto; text-align: center;">
                <span class="ad-badge">FEATURED</span>
                <h3 class="ad-title">${this.title}</h3>
                <p class="ad-subtitle" style="max-width: 600px; margin: 0 auto 20px;">${this.subtitle}</p>
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <a href="${this.link}" class="ad-cta" onclick="adManager.trackClick('${this.id}', '${this.link}')">
                        ${this.cta} <i class="fas fa-chart-line"></i>
                    </a>
                    <a href="/contact" class="btn btn-outline-light">Learn More</a>
                </div>
            </div>
        `;
    },
    
    init() {
        adManager.trackImpression(this.id);
    }
};

// ads/banner-4.js
export default {
    id: 'banner-4',
    title: 'Global Shopping Concierge',
    subtitle: 'Shop from Amazon, eBay, and more - delivered to your door',
    cta: 'Start Shopping',
    link: '/shopper-dashboard.html',
    
    render() {
        return `
            <div class="ad-content" style="background: linear-gradient(135deg, #3a5a78, #0a2540); padding: 30px; margin: 20px 0 0;">
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; max-width: 1200px; margin: 0 auto;">
                    <div style="text-align: right;">
                        <i class="fab fa-amazon" style="font-size: 40px; color: white; opacity: 0.3;"></i>
                    </div>
                    <div style="text-align: center;">
                        <span class="ad-badge">NEW</span>
                        <h3 class="ad-title" style="font-size: 20px;">${this.title}</h3>
                        <p class="ad-subtitle" style="font-size: 14px;">${this.subtitle}</p>
                        <a href="${this.link}" class="ad-cta" style="padding: 8px 20px;" onclick="adManager.trackClick('${this.id}', '${this.link}')">
                            ${this.cta} <i class="fas fa-shopping-cart"></i>
                        </a>
                    </div>
                    <div style="text-align: left;">
                        <i class="fab fa-ebay" style="font-size: 40px; color: white; opacity: 0.3;"></i>
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        adManager.trackImpression(this.id);
    }
};

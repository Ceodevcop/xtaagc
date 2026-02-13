// ads/banner-1.js
export default {
    id: 'banner-1',
    title: 'Limited Time Offer',
    subtitle: 'Get 10% off on your first order',
    cta: 'Shop Now',
    link: '/register',
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200',
    
    render() {
        return `
            <div class="ad-content" style="background: linear-gradient(135deg, #0a2540, #3a5a78); padding: 30px; border-radius: 12px; margin: 10px auto; max-width: 1200px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
                    <div style="flex: 1;">
                        <span class="ad-badge">SPECIAL OFFER</span>
                        <h3 class="ad-title">${this.title}</h3>
                        <p class="ad-subtitle">${this.subtitle}</p>
                        <a href="${this.link}" class="ad-cta" onclick="adManager.trackClick('${this.id}', '${this.link}')">
                            ${this.cta} <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                    <div style="flex: 0 0 200px; text-align: center;">
                        <img src="${this.image}" alt="Special Offer" style="max-width: 100%; border-radius: 8px; box-shadow: var(--shadow);">
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        adManager.trackImpression(this.id);
    }
};

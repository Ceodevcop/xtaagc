// ads/ads-config.js
export const AdConfig = {
    // Enable/disable ads
    enabled: true,
    
    // Ad rotation interval (in milliseconds)
    rotationInterval: 10000, // 10 seconds
    
    // Current active ads
    activeAds: {
        top: 'banner-1',      // Which banner to show on top
        bottom: 'banner-4',    // Which banner on bottom
        popup: 'banner-3',     // Which banner for popup
        sidebar: 'banner-2'    // Which banner for sidebar
    },
    
    // Ad rotation schedule (for time-based ads)
    schedule: {
        '09:00': 'banner-1',
        '12:00': 'banner-2',
        '15:00': 'banner-3',
        '18:00': 'banner-4'
    },
    
    // Ad analytics
    analytics: {
        trackClicks: true,
        trackImpressions: true,
        trackConversions: true
    },
    
    // Get current ad based on time
    getCurrentAdForPosition(position) {
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        const timeStr = `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
        
        // Check schedule
        for (const [time, ad] of Object.entries(this.schedule)) {
            if (time === timeStr) {
                return ad;
            }
        }
        
        // Return default
        return this.activeAds[position] || 'banner-1';
    }
};

export class AdManager {
    constructor() {
        this.currentAds = {};
        this.interval = null;
        this.impressions = {};
        this.clicks = {};
    }
    
    init() {
        if (!AdConfig.enabled) return;
        
        // Load all ads
        this.loadAds();
        
        // Start rotation
        this.startRotation();
        
        // Track impressions
        this.trackImpressions();
    }
    
    async loadAds() {
        const adModules = await Promise.all([
            import('./banner-1.js'),
            import('./banner-2.js'),
            import('./banner-3.js'),
            import('./banner-4.js')
        ]);
        
        adModules.forEach((module, index) => {
            const adName = `banner-${index + 1}`;
            this.currentAds[adName] = module.default;
        });
        
        // Render initial ads
        this.renderAds();
    }
    
    renderAds() {
        // Render top ad
        const topAd = this.getAdForPosition('top');
        if (topAd) {
            document.getElementById('ad-top').innerHTML = topAd.render();
            if (topAd.init) topAd.init();
        }
        
        // Render bottom ad
        const bottomAd = this.getAdForPosition('bottom');
        if (bottomAd) {
            document.getElementById('ad-bottom').innerHTML = bottomAd.render();
            if (bottomAd.init) bottomAd.init();
        }
        
        // Check for popup (show after 10 seconds)
        setTimeout(() => {
            this.showPopupAd();
        }, 10000);
    }
    
    getAdForPosition(position) {
        const adName = AdConfig.getCurrentAdForPosition(position);
        return this.currentAds[adName];
    }
    
    showPopupAd() {
        // Only show popup once per session
        if (sessionStorage.getItem('popupShown')) return;
        
        const popupAd = this.getAdForPosition('popup');
        if (popupAd && popupAd.renderPopup) {
            const modal = new Modal({
                title: popupAd.title || 'Special Offer',
                size: 'md'
            });
            
            modal.setContent(popupAd.renderPopup());
            modal.open();
            
            sessionStorage.setItem('popupShown', 'true');
        }
    }
    
    startRotation() {
        this.interval = setInterval(() => {
            this.renderAds();
        }, AdConfig.rotationInterval);
    }
    
    trackImpression(adId) {
        this.impressions[adId] = (this.impressions[adId] || 0) + 1;
        console.log(`Ad impression: ${adId}`, this.impressions);
        
        // Send to analytics
        if (AdConfig.analytics.trackImpressions) {
            // Send to Firebase or analytics service
        }
    }
    
    trackClick(adId, url) {
        this.clicks[adId] = (this.clicks[adId] || 0) + 1;
        console.log(`Ad click: ${adId}`, this.clicks);
        
        // Send to analytics
        if (AdConfig.analytics.trackClicks) {
            // Send to Firebase or analytics service
        }
        
        // Track conversion if URL is special
        if (url.includes('/register') || url.includes('/contact')) {
            this.trackConversion(adId, url);
        }
    }
    
    trackConversion(adId, url) {
        console.log(`Ad conversion: ${adId} - ${url}`);
        // Send to analytics
    }
    
    stopRotation() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// Initialize global ad manager
window.adManager = new AdManager();

const { D2CShop } = require('../features/d2c-shop/shop-system');
const { MissionsSystem } = require('../features/missions/missions-system');
const { CreatorNetwork } = require('../features/creator-network/creator-system');
const { SubscriptionSystem } = require('../features/subscriptions/subscription-system');
const { NFTBotSystem } = require('../features/nft-marketplace/nft-bot-system');
const { EventsSystem } = require('../features/events/events-system');
const { PartnershipSystem } = require('../features/partnerships/partnership-system');
const { TelegramBot } = require('../integration/telegram-bot');
const { Database } = require('./database');

class XTPEcosystem {
    constructor() {
        // Initialize database
        this.db = new Database();

        // Initialize all features
        this.shop = new D2CShop();
        this.missions = new MissionsSystem();
        this.creatorNetwork = new CreatorNetwork();
        this.subscriptions = new SubscriptionSystem();
        this.nftMarketplace = new NFTBotSystem();
        this.events = new EventsSystem();
        this.partnerships = new PartnershipSystem();

        // Initialize Telegram bot
        this.telegram = new TelegramBot(this);

        // Analytics tracking
        this.analytics = {
            dailyActiveUsers: 0,
            totalTransactions: 0,
            totalVolume: 0,
            platformRevenue: 0,
            userGrowth: []
        };

        console.log('🚀 XTP Ecosystem initialized with all 7 profitable features');
    }

    /**
     * Get comprehensive user dashboard
     */
    async getUserDashboard(userId) {
        const user = await this.db.getUser(userId);

        const dashboard = {
            profile: user,
            points: {
                balance: user.xtpBalance,
                allocated: user.allocatedPoints || 0,
                pendingEarnings: user.pendingEarnings || 0
            },
            missions: await this.missions.getUserMissions(userId),
            subscriptions: await this.getUserSubscription(userId),
            nfts: await this.getUserNFTs(userId),
            referrals: await this.creatorNetwork.getCreatorDashboard(userId),
            events: await this.getUserEvents(userId),
            performance: await this.calculateUserPerformance(userId)
        };

        return dashboard;
    }

    /**
     * Get platform-wide analytics
     */
    async getPlatformAnalytics() {
        const analytics = {
            users: await this.db.getUserStats(),
            financial: {
                totalXTPVolume: await this.calculateTotalVolume(),
                platformRevenue: await this.calculateRevenue(),
                byFeature: await this.getRevenueByFeature()
            },
            features: {
                shop: await this.shop.getRevenueComparison(),
                subscriptions: await this.subscriptions.getSubscriberStats(),
                nftMarketplace: await this.nftMarketplace.getMarketplaceAnalytics(),
                partnerships: await this.partnerships.getPartnershipAnalytics()
            },
            growth: {
                dailyActive: this.analytics.dailyActiveUsers,
                weeklyActive: await this.calculateWeeklyActive(),
                monthlyActive: await this.calculateMonthlyActive(),
                projections: this.generateProjections()
            }
        };

        return analytics;
    }

    /**
     * Cross-feature promotion engine
     */
    async promoteCrossFeature(userId) {
        const user = await this.db.getUser(userId);
        const recommendations = [];

        // If user has XTP, suggest subscriptions
        if (user.xtpBalance > 5000 && !user.subscription) {
            recommendations.push({
                feature: 'subscription',
                tier: 'bronze',
                message: '🎁 You qualify for Bronze Pass! Get 10% bot discount',
                link: '/subscribe/bronze'
            });
        }

        // If user plays games, suggest missions
        if (user.gamesPlayed > 10) {
            recommendations.push({
                feature: 'missions',
                message: '🎯 Complete daily missions and earn free XTP!',
                link: '/missions'
            });
        }

        // If user has high referral potential
        if (user.referrals > 5) {
            recommendations.push({
                feature: 'creator',
                message: '🌟 You qualify for our Creator Program! Earn 30% commission',
                link: '/creator/apply'
            });
        }

        // If user has significant balance
        if (user.xtpBalance > 100000) {
            recommendations.push({
                feature: 'nft',
                message: '💎 Mint your own NFT Bot and earn passive income!',
                link: '/nft/mint'
            });
        }

        return recommendations;
    }

    /**
     * Process transaction across features
     */
    async processTransaction(userId, amount, type, metadata = {}) {
        const transaction = {
            id: `tx_${Date.now()}_${userId}`,
            userId,
            amount,
            type,
            metadata,
            timestamp: Date.now(),
            status: 'pending'
        };

        // Update user balance
        await this.db.updateBalance(userId, amount, type);

        // Update analytics
        this.analytics.totalTransactions++;
        this.analytics.totalVolume += amount;

        // Track for specific features
        switch (type) {
            case 'shop_purchase':
                await this.analytics.trackFeature('shop', amount);
                break;
            case 'subscription':
                await this.analytics.trackFeature('subscriptions', amount);
                break;
            case 'nft_purchase':
                await this.analytics.trackFeature('nft', amount);
                break;
            case 'event_ticket':
                await this.analytics.trackFeature('events', amount);
                break;
        }

        transaction.status = 'completed';
        await this.db.saveTransaction(transaction);

        return transaction;
    }

    /**
     * Generate monthly report
     */
    async generateMonthlyReport() {
        const analytics = await this.getPlatformAnalytics();
        
        const report = {
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            summary: {
                revenue: analytics.financial.platformRevenue,
                users: analytics.users.total,
                transactions: analytics.financial.totalXTPVolume
            },
            highlights: [
                `📈 User growth: +${analytics.growth.monthlyActive}%`,
                `💰 Revenue from D2C Shop: ${analytics.features.shop.revenuePer100}`,
                `🎯 Mission completion rate: ${analytics.features.missions?.completionRate || 0}%`,
                `🤝 New creators: ${analytics.features.creatorNetwork?.newCreators || 0}`,
                `💎 NFT sales: ${analytics.features.nftMarketplace.totalVolume}`,
                `🏆 Event attendance: ${analytics.features.events?.totalAttendees || 0}`,
                `🤝 Partnership revenue: ${analytics.features.partnerships.totalRevenue || 0}`
            ],
            projections: analytics.growth.projections,
            recommendations: await this.generateStrategicRecommendations(analytics)
        };

        return report;
    }

    async generateStrategicRecommendations(analytics) {
        const recommendations = [];

        if (analytics.features.shop.revenuePer100 < 90) {
            recommendations.push('Optimize D2C shop conversion rates');
        }

        if (analytics.features.subscriptions.churnRate > 10) {
            recommendations.push('Review subscription value proposition');
        }

        if (analytics.features.nftMarketplace.totalVolume < 1000000) {
            recommendations.push('Launch NFT marketing campaign');
        }

        return recommendations;
    }

    // Helper methods
    async getUserSubscription(userId) {
        // Implementation
        return null;
    }

    async getUserNFTs(userId) {
        // Implementation
        return [];
    }

    async getUserEvents(userId) {
        // Implementation
        return [];
    }

    async calculateUserPerformance(userId) {
        // Implementation
        return {};
    }

    async calculateTotalVolume() {
        // Implementation
        return 0;
    }

    async calculateRevenue() {
        // Implementation
        return 0;
    }

    async getRevenueByFeature() {
        // Implementation
        return {};
    }

    async calculateWeeklyActive() {
        // Implementation
        return 0;
    }

    async calculateMonthlyActive() {
        // Implementation
        return 0;
    }

    generateProjections() {
        return {
            nextMonth: '+15%',
            nextQuarter: '+45%',
            nextYear: '+200%'
        };
    }
}

module.exports = { XTPEcosystem };

class SubscriptionSystem {
    constructor() {
        this.tiers = {
            bronze: {
                name: 'Bronze Pass',
                price: 500, // XTP per month
                benefits: {
                    botDiscount: 0.10,
                    dailySpins: 1,
                    prioritySupport: false,
                    exclusiveBots: false,
                    profitSharing: false
                },
                requirements: {
                    minBalance: 0
                }
            },
            silver: {
                name: 'Silver Pass',
                price: 2000,
                benefits: {
                    botDiscount: 0.25,
                    dailySpins: 3,
                    prioritySupport: true,
                    exclusiveBots: false,
                    profitSharing: false
                },
                requirements: {
                    minBalance: 5000
                }
            },
            gold: {
                name: 'Gold Pass',
                price: 5000,
                benefits: {
                    botDiscount: 0.50,
                    dailySpins: 5,
                    prioritySupport: true,
                    exclusiveBots: true,
                    profitSharing: 0.10 // 10% profit sharing
                },
                requirements: {
                    minBalance: 20000
                }
            }
        };

        this.subscribers = new Map();
        this.subscriptionPayments = [];
    }

    /**
     * Subscribe user to tier
     */
    async subscribe(userId, tierId, paymentMethod = 'xtp') {
        const tier = this.tiers[tierId];
        if (!tier) throw new Error('Invalid tier');

        // Check requirements
        const user = await this.getUser(userId);
        if (user.xtpBalance < (tier.requirements.minBalance || 0)) {
            throw new Error(`Need ${tier.requirements.minBalance} XTP minimum balance`);
        }

        // Process payment
        if (paymentMethod === 'xtp') {
            if (user.xtpBalance < tier.price) {
                throw new Error('Insufficient XTP balance');
            }
            await this.deductXTP(userId, tier.price, 'subscription', tierId);
        }

        // Create subscription
        const subscription = {
            id: `sub_${userId}_${Date.now()}`,
            userId,
            tierId,
            startDate: Date.now(),
            nextBilling: Date.now() + (30 * 24 * 3600000), // 30 days
            status: 'active',
            autoRenew: true,
            benefits: tier.benefits,
            paymentMethod
        };

        this.subscribers.set(subscription.id, subscription);
        await this.saveSubscription(subscription);

        // Apply benefits immediately
        await this.applyBenefits(userId, tier.benefits);

        return subscription;
    }

    /**
     * Process monthly renewals
     */
    async processRenewals() {
        const now = Date.now();
        const renewed = [];

        for (const [id, sub] of this.subscribers) {
            if (sub.nextBilling <= now && sub.status === 'active') {
                try {
                    const user = await this.getUser(sub.userId);
                    
                    if (user.xtpBalance >= this.tiers[sub.tierId].price) {
                        // Auto-renew
                        await this.deductXTP(
                            sub.userId, 
                            this.tiers[sub.tierId].price, 
                            'subscription_renewal', 
                            sub.tierId
                        );

                        sub.nextBilling = now + (30 * 24 * 3600000);
                        renewed.push(sub.id);

                        // Send renewal notification
                        await this.sendRenewalNotice(sub.userId, 'success');
                    } else {
                        // Insufficient balance - downgrade or cancel
                        sub.status = 'payment_failed';
                        await this.handleFailedPayment(sub);
                    }

                    await this.updateSubscription(sub);
                } catch (error) {
                    console.error(`Renewal failed for ${id}:`, error);
                }
            }
        }

        return renewed;
    }

    /**
     * Calculate subscription value
     */
    calculateValue(tierId, usage) {
        const tier = this.tiers[tierId];
        const benefits = tier.benefits;

        // Calculate monetary value of benefits
        let monthlyValue = 0;

        // Bot rental savings
        if (usage.botHours) {
            const savings = usage.botHours * 0.5 * benefits.botDiscount;
            monthlyValue += savings;
        }

        // Daily spin value
        if (benefits.dailySpins) {
            const spinValue = benefits.dailySpins * 30 * 5; // 5 XTP per spin avg
            monthlyValue += spinValue;
        }

        // Exclusive bot access
        if (benefits.exclusiveBots && usage.exclusiveBotsUsed) {
            monthlyValue += 1000; // Approx value of exclusive bots
        }

        // Profit sharing
        if (benefits.profitSharing && usage.profits) {
            monthlyValue += usage.profits * benefits.profitSharing;
        }

        return {
            monthlyValue,
            roi: ((monthlyValue - tier.price) / tier.price * 100).toFixed(2) + '%',
            paybackPeriod: (tier.price / (monthlyValue / 30)).toFixed(1) + ' days'
        };
    }

    /**
     * Get subscriber statistics
     */
    getSubscriberStats() {
        const stats = {
            total: 0,
            byTier: { bronze: 0, silver: 0, gold: 0 },
            monthlyRevenue: 0,
            churnRate: 0,
            lifetimeValue: 0
        };

        for (const sub of this.subscribers.values()) {
            stats.total++;
            stats.byTier[sub.tierId]++;

            if (sub.status === 'active') {
                stats.monthlyRevenue += this.tiers[sub.tierId].price;
            }
        }

        // Calculate churn (last 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 3600000);
        const cancelled = Array.from(this.subscribers.values())
            .filter(s => s.status === 'cancelled' && s.cancelledAt > thirtyDaysAgo)
            .length;

        stats.churnRate = (cancelled / stats.total * 100).toFixed(2) + '%';

        // Average lifetime value
        const avgLifetime = 12; // months (industry average)
        stats.lifetimeValue = stats.monthlyRevenue / stats.total * avgLifetime;

        return stats;
    }

    async applyBenefits(userId, benefits) {
        // Apply discount to user account
        await this.updateUser(userId, {
            subscriptionBenefits: benefits,
            botDiscount: benefits.botDiscount,
            dailySpins: benefits.dailySpins
        });
    }

    async handleFailedPayment(sub) {
        // Attempt downgrade
        if (sub.tierId === 'gold') {
            sub.tierId = 'silver';
            sub.status = 'active';
            await this.applyBenefits(sub.userId, this.tiers.silver.benefits);
        } else if (sub.tierId === 'silver') {
            sub.tierId = 'bronze';
            sub.status = 'active';
            await this.applyBenefits(sub.userId, this.tiers.bronze.benefits);
        } else {
            sub.status = 'cancelled';
            await this.removeBenefits(sub.userId);
        }
    }

    async sendRenewalNotice(userId, status) {
        // Send Telegram notification
        console.log(`Renewal ${status} for user ${userId}`);
    }
}

module.exports = { SubscriptionSystem };

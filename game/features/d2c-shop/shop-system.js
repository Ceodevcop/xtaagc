class D2CShop {
    constructor() {
        this.shopUrl = 'https://shop.taagc.website';
        this.paymentProcessors = {
            appcharge: {
                fee: 0.02, // 2% processing fee
                settlement: 'instant'
            },
            crypto: {
                fee: 0.01, // 1% for crypto payments
                settlement: 'instant'
            },
            bank: {
                fee: 0.03, // 3% for bank transfers
                settlement: '2-3 days'
            }
        };
        
        this.products = {
            xtp_packs: [
                { id: 'xtp_100', amount: 100, price: 100, bonus: 0 },
                { id: 'xtp_500', amount: 500, price: 500, bonus: 25 },
                { id: 'xtp_1000', amount: 1000, price: 1000, bonus: 100 },
                { id: 'xtp_5000', amount: 5000, price: 5000, bonus: 750 },
                { id: 'xtp_10000', amount: 10000, price: 10000, bonus: 2000 }
            ],
            bot_passes: [
                { id: 'pass_weekly', type: 'weekly_bot', price: 500, xtpValue: 500 },
                { id: 'pass_monthly', type: 'monthly_bot', price: 1800, xtpValue: 2000 }
            ],
            merch: [
                { id: 'merch_tshirt', name: 'XTP T-Shirt', price: 25, xtpValue: 25 },
                { id: 'merch_hoodie', name: 'XTP Hoodie', price: 50, xtpValue: 50 },
                { id: 'merch_cap', name: 'XTP Cap', price: 15, xtpValue: 15 }
            ]
        };
    }

    /**
     * Process purchase with bonus structure
     */
    async processPurchase(userId, productId, paymentMethod) {
        const product = this.findProduct(productId);
        if (!product) throw new Error('Product not found');

        // Calculate bonus based on volume
        const bonusPercent = this.calculateBonus(product.amount);
        const totalXTP = product.amount + (product.amount * bonusPercent);

        // Process payment
        const payment = await this.processPayment(userId, product.price, paymentMethod);
        
        // Credit user account
        await this.creditUser(userId, totalXTP, {
            type: 'shop_purchase',
            product: productId,
            paymentMethod
        });

        // Track for analytics
        await this.trackPurchase(userId, product, payment);

        return {
            success: true,
            xtpReceived: totalXTP,
            baseAmount: product.amount,
            bonus: product.amount * bonusPercent,
            transactionId: payment.id
        };
    }

    calculateBonus(amount) {
        if (amount >= 10000) return 0.20; // 20% bonus
        if (amount >= 5000) return 0.15;  // 15% bonus
        if (amount >= 1000) return 0.10;   // 10% bonus
        if (amount >= 500) return 0.05;    // 5% bonus
        return 0;
    }

    /**
     * Create affiliate link for creators
     */
    async createAffiliateLink(userId, productId, discountPercent = 0) {
        const code = `XTP_${userId}_${Date.now().toString(36)}`;
        
        await this.saveAffiliateCode({
            code,
            userId,
            productId,
            discountPercent,
            uses: 0,
            maxUses: 100,
            revenue: 0
        });

        return `${this.shopUrl}?ref=${code}`;
    }

    /**
     * Revenue comparison dashboard
     */
    getRevenueComparison() {
        return {
            appleGoogle: {
                revenuePer100: 70,
                fee: '30%',
                dataOwnership: false
            },
            d2cShop: {
                revenuePer100: 97,
                fee: '3%',
                dataOwnership: true,
                customerLifetime: '5x higher'
            },
            advantage: {
                extraPer100: 27,
                percentIncrease: '38.6%'
            }
        };
    }
}

module.exports = { D2CShop };

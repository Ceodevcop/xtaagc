class NFTBotSystem {
    constructor() {
        this.botNFTs = {
            common: {
                supply: 5000,
                price: 1000,
                benefits: {
                    tradingFee: 0.95, // 5% discount
                    rentalIncome: 0.70, // 70% to owner
                    exclusiveAccess: false
                },
                rarity: 'Common'
            },
            rare: {
                supply: 3000,
                price: 5000,
                benefits: {
                    tradingFee: 0.90, // 10% discount
                    rentalIncome: 0.75,
                    exclusiveAccess: 'basic'
                },
                rarity: 'Rare'
            },
            epic: {
                supply: 1500,
                price: 25000,
                benefits: {
                    tradingFee: 0.85, // 15% discount
                    rentalIncome: 0.80,
                    exclusiveAccess: 'advanced'
                },
                rarity: 'Epic'
            },
            legendary: {
                supply: 400,
                price: 100000,
                benefits: {
                    tradingFee: 0.80, // 20% discount
                    rentalIncome: 0.85,
                    exclusiveAccess: 'all',
                    governance: true
                },
                rarity: 'Legendary'
            },
            mythic: {
                supply: 100,
                price: 1000000,
                benefits: {
                    tradingFee: 0.70, // 30% discount
                    rentalIncome: 0.90,
                    exclusiveAccess: 'all',
                    governance: true,
                    profitSharing: 0.05 // 5% platform profit share
                },
                rarity: 'Mythic'
            }
        };

        this.marketplace = new Map();
        this.rentals = new Map();
        this.ownedBots = new Map();
    }

    /**
     * Mint new NFT bot
     */
    async mintBot(userId, rarity) {
        const botType = this.botNFTs[rarity];
        if (!botType) throw new Error('Invalid rarity');

        // Check supply
        const minted = await this.getMintedCount(rarity);
        if (minted >= botType.supply) {
            throw new Error(`No more ${rarity} bots available`);
        }

        // Process payment
        const user = await this.getUser(userId);
        if (user.xtpBalance < botType.price) {
            throw new Error(`Need ${botType.price} XTP to mint this bot`);
        }

        await this.deductXTP(userId, botType.price, 'nft_mint', rarity);

        // Generate unique bot
        const bot = {
            id: `bot_${Date.now()}_${userId}_${rarity}`,
            tokenId: this.generateTokenId(),
            owner: userId,
            rarity,
            benefits: botType.benefits,
            mintedAt: Date.now(),
            stats: {
                rentals: 0,
                earnings: 0,
                trades: 0
            },
            metadata: {
                name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Bot #${this.getNextNumber(rarity)}`,
                image: `https://assets.taagc.website/nfts/${rarity}/${Date.now()}.png`,
                attributes: this.generateAttributes(rarity)
            }
        };

        // Store bot
        this.ownedBots.set(bot.id, bot);
        await this.saveNFT(bot);

        // Credit 5% royalty to platform treasury
        const royalty = botType.price * 0.05;
        await this.creditTreasury(royalty);

        return bot;
    }

    /**
     * List bot on marketplace
     */
    async listBotForSale(botId, sellerId, price) {
        const bot = this.ownedBots.get(botId);
        if (!bot || bot.owner !== sellerId) {
            throw new Error('Bot not found or not owned by you');
        }

        const listing = {
            id: `listing_${Date.now()}`,
            botId,
            sellerId,
            price,
            listedAt: Date.now(),
            status: 'active'
        };

        this.marketplace.set(listing.id, listing);
        await this.saveListing(listing);

        return listing;
    }

    /**
     * Buy bot from marketplace
     */
    async buyBot(listingId, buyerId) {
        const listing = this.marketplace.get(listingId);
        if (!listing || listing.status !== 'active') {
            throw new Error('Listing not available');
        }

        const bot = this.ownedBots.get(listing.botId);
        const buyer = await this.getUser(buyerId);

        // Process payment
        if (buyer.xtpBalance < listing.price) {
            throw new Error('Insufficient funds');
        }

        await this.deductXTP(buyerId, listing.price, 'nft_purchase', bot.rarity);

        // Transfer funds (95% to seller, 5% royalty)
        const sellerAmount = listing.price * 0.95;
        const royalty = listing.price * 0.05;

        await this.creditXTP(listing.sellerId, sellerAmount, 'nft_sale');
        await this.creditTreasury(royalty);

        // Transfer ownership
        const previousOwner = bot.owner;
        bot.owner = buyerId;
        bot.transferHistory = bot.transferHistory || [];
        bot.transferHistory.push({
            from: previousOwner,
            to: buyerId,
            price: listing.price,
            date: Date.now()
        });

        // Update marketplace
        listing.status = 'sold';
        listing.soldAt = Date.now();
        listing.buyerId = buyerId;

        await this.updateNFT(bot);
        await this.updateListing(listing);

        return {
            bot,
            sellerAmount,
            royalty,
            transaction: listing
        };
    }

    /**
     * Rent bot to another user
     */
    async rentBot(botId, ownerId, renterId, hours, rentalRate) {
        const bot = this.ownedBots.get(botId);
        if (!bot || bot.owner !== ownerId) {
            throw new Error('Bot not available for rent');
        }

        const totalCost = rentalRate * hours;
        const renter = await this.getUser(renterId);

        if (renter.xtpBalance < totalCost) {
            throw new Error('Insufficient funds for rental');
        }

        // Process payment
        await this.deductXTP(renterId, totalCost, 'bot_rental', botId);

        // Split payment (70-90% to owner based on rarity, rest to platform)
        const ownerShare = totalCost * bot.benefits.rentalIncome;
        const platformShare = totalCost * (1 - bot.benefits.rentalIncome);

        await this.creditXTP(ownerId, ownerShare, 'rental_income');
        await this.creditTreasury(platformShare);

        // Create rental record
        const rental = {
            id: `rental_${Date.now()}`,
            botId,
            ownerId,
            renterId,
            hours,
            rate: rentalRate,
            totalCost,
            ownerShare,
            platformShare,
            startTime: Date.now(),
            endTime: Date.now() + (hours * 3600000),
            status: 'active'
        };

        this.rentals.set(rental.id, rental);

        // Update bot stats
        bot.stats.rentals++;
        bot.stats.earnings += ownerShare;

        await this.saveRental(rental);
        await this.updateNFT(bot);

        return rental;
    }

    /**
     * Get marketplace analytics
     */
    getMarketplaceAnalytics() {
        const stats = {
            totalBots: this.ownedBots.size,
            listedBots: 0,
            totalVolume: 0,
            averagePrice: 0,
            byRarity: {},
            recentSales: []
        };

        let volumeSum = 0;
        let saleCount = 0;

        for (const listing of this.marketplace.values()) {
            if (listing.status === 'active') {
                stats.listedBots++;
            }

            if (listing.status === 'sold') {
                const bot = this.ownedBots.get(listing.botId);
                stats.totalVolume += listing.price;
                volumeSum += listing.price;
                saleCount++;

                if (!stats.byRarity[bot.rarity]) {
                    stats.byRarity[bot.rarity] = { sales: 0, volume: 0 };
                }
                stats.byRarity[bot.rarity].sales++;
                stats.byRarity[bot.rarity].volume += listing.price;
            }
        }

        stats.averagePrice = saleCount > 0 ? volumeSum / saleCount : 0;

        // Royalty revenue
        stats.platformRoyalties = stats.totalVolume * 0.05;

        return stats;
    }

    generateTokenId() {
        return 'XTP' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    generateAttributes(rarity) {
        const attributes = {
            common: { power: 50, speed: 50, intelligence: 50 },
            rare: { power: 65, speed: 65, intelligence: 65 },
            epic: { power: 80, speed: 80, intelligence: 80 },
            legendary: { power: 90, speed: 90, intelligence: 90 },
            mythic: { power: 99, speed: 99, intelligence: 99 }
        };
        return attributes[rarity];
    }

    async getMintedCount(rarity) {
        let count = 0;
        for (const bot of this.ownedBots.values()) {
            if (bot.rarity === rarity) count++;
        }
        return count;
    }

    getNextNumber(rarity) {
        let count = 0;
        for (const bot of this.ownedBots.values()) {
            if (bot.rarity === rarity) count++;
        }
        return count + 1;
    }
}

module.exports = { NFTBotSystem };

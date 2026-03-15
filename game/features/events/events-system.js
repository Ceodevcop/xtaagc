class EventsSystem {
    constructor() {
        this.eventTypes = {
            online_tournament: {
                revenueShare: { platform: 0.30, winners: 0.70 },
                minEntry: 50,
                maxParticipants: 1000
            },
            physical_meetup: {
                revenueShare: { platform: 0.40, venue: 0.30, speakers: 0.30 },
                ticketTiers: ['general', 'vip', 'early_bird']
            },
            virtual_conference: {
                revenueShare: { platform: 0.35, speakers: 0.65 },
                sponsorshipTiers: ['bronze', 'silver', 'gold', 'platinum']
            }
        };

        this.merchStore = {
            products: [
                { id: 'tshirt', name: 'XTP T-Shirt', price: 25, xtpPrice: 25, cost: 12, profit: 13 },
                { id: 'hoodie', name: 'XTP Hoodie', price: 50, xtpPrice: 50, cost: 25, profit: 25 },
                { id: 'cap', name: 'XTP Cap', price: 15, xtpPrice: 15, cost: 7, profit: 8 },
                { id: 'mousepad', name: 'XTP Mousepad', price: 20, xtpPrice: 20, cost: 9, profit: 11 },
                { id: 'collectible', name: 'XTP Collectible Figure', price: 100, xtpPrice: 100, cost: 40, profit: 60 }
            ],
            limitedEditions: [
                { id: 'gold_nft_physical', name: 'Gold Bot Physical Replica', price: 500, xtpPrice: 500, limited: 100 }
            ]
        };

        this.events = new Map();
        this.tickets = new Map();
        this.merchOrders = new Map();
    }

    /**
     * Create new event
     */
    async createEvent(eventData) {
        const event = {
            id: `event_${Date.now()}`,
            name: eventData.name,
            type: eventData.type,
            date: eventData.date,
            venue: eventData.venue,
            capacity: eventData.capacity,
            ticketTiers: this.generateTicketTiers(eventData),
            sponsors: [],
            status: 'upcoming',
            createdAt: Date.now(),
            stats: {
                ticketsSold: 0,
                revenue: 0,
                attendees: 0
            }
        };

        this.events.set(event.id, event);
        await this.saveEvent(event);

        return event;
    }

    /**
     * Purchase event ticket
     */
    async purchaseTicket(eventId, userId, tier, quantity = 1) {
        const event = this.events.get(eventId);
        if (!event) throw new Error('Event not found');

        const ticketTier = event.ticketTiers.find(t => t.name === tier);
        if (!ticketTier) throw new Error('Invalid ticket tier');

        if (ticketTier.sold + quantity > ticketTier.quantity) {
            throw new Error('Not enough tickets available');
        }

        const totalPrice = ticketTier.price * quantity;
        const user = await this.getUser(userId);

        // Process payment
        if (user.xtpBalance < totalPrice) {
            throw new Error('Insufficient XTP balance');
        }

        await this.deductXTP(userId, totalPrice, 'event_ticket', eventId);

        // Create tickets
        const tickets = [];
        for (let i = 0; i < quantity; i++) {
            const ticket = {
                id: `ticket_${Date.now()}_${i}`,
                eventId,
                userId,
                tier,
                price: ticketTier.price,
                qrCode: this.generateQRCode(),
                used: false,
                purchasedAt: Date.now()
            };
            tickets.push(ticket);
            this.tickets.set(ticket.id, ticket);
        }

        // Update event stats
        ticketTier.sold += quantity;
        event.stats.ticketsSold += quantity;
        event.stats.revenue += totalPrice;

        await this.updateEvent(event);
        await this.saveTickets(tickets);

        return tickets;
    }

    /**
     * Merchandise order
     */
    async orderMerch(userId, items, shippingAddress) {
        let totalXTP = 0;
        let totalCost = 0;
        const orderItems = [];

        for (const item of items) {
            const product = this.merchStore.products.find(p => p.id === item.id) ||
                           this.merchStore.limitedEditions.find(p => p.id === item.id);

            if (!product) throw new Error(`Product ${item.id} not found`);

            totalXTP += product.xtpPrice * item.quantity;
            totalCost += product.cost * item.quantity;

            orderItems.push({
                ...product,
                quantity: item.quantity,
                subtotal: product.xtpPrice * item.quantity
            });
        }

        const user = await this.getUser(userId);
        if (user.xtpBalance < totalXTP) {
            throw new Error('Insufficient XTP balance');
        }

        // Process payment
        await this.deductXTP(userId, totalXTP, 'merchandise');

        // Create order
        const order = {
            id: `order_${Date.now()}_${userId}`,
            userId,
            items: orderItems,
            totalXTP,
            totalCost,
            profit: totalXTP - totalCost,
            shippingAddress,
            status: 'pending',
            trackingNumber: null,
            orderedAt: Date.now()
        };

        this.merchOrders.set(order.id, order);
        await this.saveOrder(order);

        // Initiate fulfillment
        await this.processFulfillment(order);

        return order;
    }

    /**
     * Host online tournament
     */
    async createTournament(tournamentData) {
        const tournament = {
            id: `tourney_${Date.now()}`,
            name: tournamentData.name,
            game: tournamentData.game,
            entryFee: tournamentData.entryFee,
            prizePool: tournamentData.prizePool,
            maxPlayers: tournamentData.maxPlayers,
            registered: [],
            status: 'upcoming',
            startTime: tournamentData.startTime,
            bracket: null,
            winners: []
        };

        // Prize pool breakdown
        const platformFee = tournamentData.entryFee * tournamentData.maxPlayers * 0.30;
        const prizeDistribution = this.calculatePrizes(tournamentData.prizePool);

        tournament.prizeBreakdown = {
            total: tournamentData.prizePool,
            platformFee,
            first: prizeDistribution.first,
            second: prizeDistribution.second,
            third: prizeDistribution.third
        };

        this.events.set(tournament.id, tournament);
        return tournament;
    }

    /**
     * Register for tournament
     */
    async registerTournament(userId, tournamentId) {
        const tournament = this.events.get(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        if (tournament.registered.length >= tournament.maxPlayers) {
            throw new Error('Tournament is full');
        }

        const user = await this.getUser(userId);
        if (user.xtpBalance < tournament.entryFee) {
            throw new Error('Insufficient XTP balance');
        }

        // Process payment
        await this.deductXTP(userId, tournament.entryFee, 'tournament_entry', tournamentId);

        // Register user
        tournament.registered.push({
            userId,
            username: user.username,
            registeredAt: Date.now()
        });

        tournament.prizeBreakdown.platformFee += tournament.entryFee * 0.30;

        await this.updateEvent(tournament);

        return tournament;
    }

    generateTicketTiers(eventData) {
        const tiers = [];
        
        if (eventData.earlyBird) {
            tiers.push({
                name: 'early_bird',
                price: eventData.earlyBirdPrice,
                quantity: eventData.earlyBirdQuantity,
                sold: 0,
                benefits: ['Priority seating', 'Exclusive merch']
            });
        }

        tiers.push({
            name: 'general',
            price: eventData.generalPrice,
            quantity: eventData.capacity - (eventData.earlyBirdQuantity || 0),
            sold: 0,
            benefits: ['General admission']
        });

        if (eventData.vip) {
            tiers.push({
                name: 'vip',
                price: eventData.vipPrice,
                quantity: eventData.vipQuantity,
                sold: 0,
                benefits: ['VIP lounge', 'Meet & greet', 'Free merch']
            });
        }

        return tiers;
    }

    calculatePrizes(totalPool) {
        return {
            first: totalPool * 0.50,
            second: totalPool * 0.30,
            third: totalPool * 0.20
        };
    }

    generateQRCode() {
        return 'QR' + Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
    }

    async processFulfillment(order) {
        // Integration with shipping provider
        console.log(`Processing fulfillment for order ${order.id}`);
    }
}

module.exports = { EventsSystem };

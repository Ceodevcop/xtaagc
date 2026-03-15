// XTP Firebase Integration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInAnonymously,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    push, 
    get, 
    update,
    onValue,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAI1MrcP977UgRLQoePxl64JOSyj9v4WpI",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c",
    measurementId: "G-1D2RPBMML3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// XTP Database Structure
const XTPDatabase = {
    // User XTP Data
    users: {
        async getUser(userId) {
            const snapshot = await get(ref(db, `users/${userId}`));
            return snapshot.val() || {
                xtpBalance: 0,
                pendingEarnings: 0,
                totalEarned: 0,
                subscription: null,
                nfts: [],
                missions: {},
                referrals: 0,
                createdAt: serverTimestamp()
            };
        },

        async updateUser(userId, data) {
            await update(ref(db, `users/${userId}`), data);
        },

        async addXTP(userId, amount, reason) {
            const user = await this.getUser(userId);
            const newBalance = (user.xtpBalance || 0) + amount;
            
            await this.updateUser(userId, {
                xtpBalance: newBalance,
                lastUpdated: serverTimestamp()
            });

            // Record transaction
            await push(ref(db, `transactions/${userId}`), {
                type: 'credit',
                amount,
                reason,
                balance: newBalance,
                timestamp: serverTimestamp()
            });

            return newBalance;
        },

        async deductXTP(userId, amount, reason) {
            const user = await this.getUser(userId);
            if ((user.xtpBalance || 0) < amount) {
                throw new Error('Insufficient XTP balance');
            }

            const newBalance = (user.xtpBalance || 0) - amount;
            
            await this.updateUser(userId, {
                xtpBalance: newBalance,
                lastUpdated: serverTimestamp()
            });

            // Record transaction
            await push(ref(db, `transactions/${userId}`), {
                type: 'debit',
                amount,
                reason,
                balance: newBalance,
                timestamp: serverTimestamp()
            });

            return newBalance;
        }
    },

    // Shop
    shop: {
        async purchase(userId, productId, amount, paymentMethod) {
            const order = {
                userId,
                productId,
                amount,
                paymentMethod,
                status: 'completed',
                timestamp: serverTimestamp()
            };

            await push(ref(db, 'shop_orders'), order);
            await XTPDatabase.users.addXTP(userId, amount, 'shop_purchase');

            return order;
        },

        async getProducts() {
            const snapshot = await get(ref(db, 'shop_products'));
            return snapshot.val() || {};
        }
    },

    // Missions
    missions: {
        async completeMission(userId, missionId, reward) {
            await XTPDatabase.users.addXTP(userId, reward, `mission_${missionId}`);
            
            await update(ref(db, `users/${userId}/missions/${missionId}`), {
                completed: true,
                completedAt: serverTimestamp(),
                reward
            });
        },

        async getDailyMissions(userId) {
            const snapshot = await get(ref(db, `users/${userId}/missions/daily`));
            return snapshot.val() || {};
        }
    },

    // Subscriptions
    subscriptions: {
        async subscribe(userId, tier) {
            const tiers = {
                bronze: { price: 500, benefits: { botDiscount: 0.10, dailySpins: 1 } },
                silver: { price: 2000, benefits: { botDiscount: 0.25, dailySpins: 3 } },
                gold: { price: 5000, benefits: { botDiscount: 0.50, dailySpins: 5, profitShare: 0.10 } }
            };

            const tierData = tiers[tier];
            if (!tierData) throw new Error('Invalid tier');

            await XTPDatabase.users.deductXTP(userId, tierData.price, `subscription_${tier}`);

            const subscription = {
                userId,
                tier,
                startDate: serverTimestamp(),
                nextBilling: Date.now() + 30 * 24 * 60 * 60 * 1000,
                benefits: tierData.benefits,
                active: true
            };

            await set(ref(db, `subscriptions/${userId}`), subscription);
            await update(ref(db, `users/${userId}`), { subscription: tier });

            return subscription;
        }
    },

    // NFT Bots
    nfts: {
        async mint(userId, rarity) {
            const prices = {
                common: 1000,
                rare: 5000,
                epic: 25000,
                legendary: 100000,
                mythic: 1000000
            };

            const price = prices[rarity];
            if (!price) throw new Error('Invalid rarity');

            await XTPDatabase.users.deductXTP(userId, price, `nft_mint_${rarity}`);

            const nft = {
                id: `nft_${Date.now()}`,
                owner: userId,
                rarity,
                mintedAt: serverTimestamp(),
                stats: {
                    power: Math.floor(Math.random() * 50) + 50,
                    rentals: 0,
                    earnings: 0
                }
            };

            await push(ref(db, `nfts/${userId}`), nft);

            return nft;
        },

        async getUserNFTs(userId) {
            const snapshot = await get(ref(db, `nfts/${userId}`));
            return snapshot.val() || {};
        }
    },

    // Events & Tournaments
    events: {
        async joinTournament(userId, tournamentId, entryFee) {
            await XTPDatabase.users.deductXTP(userId, entryFee, `tournament_${tournamentId}`);

            const entry = {
                userId,
                tournamentId,
                joinedAt: serverTimestamp()
            };

            await push(ref(db, `tournaments/${tournamentId}/participants`), entry);

            return entry;
        }
    },

    // Creator Network
    creators: {
        async apply(userId, platform, followers) {
            const application = {
                userId,
                platform,
                followers,
                status: 'pending',
                appliedAt: serverTimestamp()
            };

            await set(ref(db, `creator_applications/${userId}`), application);

            return application;
        },

        async generateAffiliateLink(userId) {
            const code = `XTP_${userId}_${Date.now().toString(36)}`;
            
            await set(ref(db, `affiliate_links/${code}`), {
                userId,
                createdAt: serverTimestamp(),
                clicks: 0,
                conversions: 0,
                earnings: 0
            });

            return `https://game.taagc.website/xtp-ecosystem/shop?ref=${code}`;
        }
    },

    // Analytics
    analytics: {
        async trackEvent(userId, event, data = {}) {
            await push(ref(db, `analytics/${userId}`), {
                event,
                data,
                timestamp: serverTimestamp()
            });
        },

        async getPlatformStats() {
            const snapshot = await get(ref(db, 'stats'));
            return snapshot.val() || {
                totalUsers: 0,
                totalTransactions: 0,
                totalVolume: 0,
                activeBots: 0,
                nftsMinted: 0
            };
        }
    }
};

// Export for use
window.XTPDatabase = XTPDatabase;
window.firebaseAuth = auth;
window.firebaseDB = db;

// Auto-login anonymous users
signInAnonymously(auth).catch(console.error);

// Track user on auth change
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Get or create user data
        const userData = await XTPDatabase.users.getUser(user.uid);
        
        // Update last seen
        await XTPDatabase.users.updateUser(user.uid, {
            lastSeen: serverTimestamp(),
            uid: user.uid
        });

        // Update XTP balance display on all pages
        document.querySelectorAll('[id$="XTP"], [id$="Balance"]').forEach(el => {
            if (el.id === 'xtpBalance' || el.id === 'userXTP' || el.id === 'headerXTP') {
                el.textContent = (userData.xtpBalance || 0).toLocaleString();
            }
        });

        // Track login event
        await XTPDatabase.analytics.trackEvent(user.uid, 'login');
    }
});

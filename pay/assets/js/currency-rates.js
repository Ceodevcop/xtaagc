// ============================================
// TAAGC REAL-TIME CURRENCY RATES
// Fetches live rates from multiple sources
// Updates Firebase every minute
// ============================================

const currencyRates = {
    // Default rates (fallback)
    defaultRates: {
        USD: 1.00,
        NGN: 1540.00,
        EUR: 0.92,
        GBP: 0.79,
        CAD: 1.35,
        AUD: 1.52,
        JPY: 148.50,
        CNY: 7.19,
        INR: 83.12,
        BTC: 0.000015,
        ETH: 0.00028,
        USDT: 1.00
    },

    // API Sources (multiple for redundancy)
    apis: {
        exchangerate: 'https://api.exchangerate-api.com/v4/latest/USD',
        frankfurter: 'https://api.frankfurter.app/latest?from=USD',
        coinbase: 'https://api.coinbase.com/v2/exchange-rates?currency=USD'
    },

    // Initialize real-time updates
    init: async function() {
        console.log('🚀 Initializing real-time currency rates...');
        
        // Load from Firebase first
        await this.loadFromFirebase();
        
        // Fetch live rates immediately
        await this.fetchAllRates();
        
        // Update every 60 seconds
        setInterval(() => this.fetchAllRates(), 60000);
        
        // Also update on page focus
        window.addEventListener('focus', () => this.fetchAllRates());
    },

    // Load rates from Firebase
    loadFromFirebase: async function() {
        try {
            const ratesDoc = await db.collection('system').doc('currency_rates').get();
            if (ratesDoc.exists) {
                const data = ratesDoc.data();
                window.currentRates = data.rates || this.defaultRates;
                window.lastUpdate = data.lastUpdate?.toDate?.() || new Date();
                console.log('✅ Rates loaded from Firebase:', window.currentRates);
            } else {
                // Initialize with default rates
                window.currentRates = this.defaultRates;
                await this.saveToFirebase();
            }
        } catch (error) {
            console.error('Error loading rates from Firebase:', error);
            window.currentRates = this.defaultRates;
        }
    },

    // Save rates to Firebase
    saveToFirebase: async function(rates = window.currentRates) {
        try {
            await db.collection('system').doc('currency_rates').set({
                rates: rates,
                lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: auth.currentUser?.uid || 'system'
            });
            console.log('✅ Rates saved to Firebase');
        } catch (error) {
            console.error('Error saving rates to Firebase:', error);
        }
    },

    // Fetch from all APIs
    fetchAllRates: async function() {
        console.log('🔄 Fetching live currency rates...');
        
        let newRates = { ...this.defaultRates };
        let successCount = 0;

        // Try ExchangeRate API
        try {
            const response = await fetch(this.apis.exchangerate);
            const data = await response.json();
            if (data.rates) {
                newRates = { ...newRates, ...data.rates };
                successCount++;
            }
        } catch (error) {
            console.warn('ExchangeRate API failed:', error);
        }

        // Try Frankfurter API
        try {
            const response = await fetch(this.apis.frankfurter);
            const data = await response.json();
            if (data.rates) {
                newRates = { ...newRates, ...data.rates };
                successCount++;
            }
        } catch (error) {
            console.warn('Frankfurter API failed:', error);
        }

        // Try Coinbase for crypto
        try {
            const response = await fetch(this.apis.coinbase);
            const data = await response.json();
            if (data.data?.rates) {
                const rates = data.data.rates;
                newRates.BTC = parseFloat(rates.BTC) || this.defaultRates.BTC;
                newRates.ETH = parseFloat(rates.ETH) || this.defaultRates.ETH;
                successCount++;
            }
        } catch (error) {
            console.warn('Coinbase API failed:', error);
        }

        // Update if we got at least one source
        if (successCount > 0) {
            window.currentRates = newRates;
            await this.saveToFirebase(newRates);
            
            // Trigger update event
            window.dispatchEvent(new CustomEvent('rates-updated', { 
                detail: { rates: newRates, timestamp: Date.now() }
            }));
            
            console.log(`✅ Rates updated from ${successCount} sources`);
        } else {
            console.warn('⚠️ Using cached rates from Firebase');
        }
        
        return window.currentRates;
    },

    // Convert amount between currencies
    convert: function(amount, fromCurrency, toCurrency) {
        const rates = window.currentRates || this.defaultRates;
        
        // Convert to USD first (base)
        const usdAmount = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
        
        // Convert from USD to target
        return toCurrency === 'USD' ? usdAmount : usdAmount * rates[toCurrency];
    },

    // Get formatted rate
    getRateDisplay: function(fromCurrency, toCurrency) {
        const rates = window.currentRates || this.defaultRates;
        const rate = rates[toCurrency] / rates[fromCurrency];
        return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
    },

    // Subscribe to rate updates
    subscribe: function(callback) {
        window.addEventListener('rates-updated', (event) => {
            callback(event.detail.rates);
        });
        
        // Immediate callback with current rates
        if (window.currentRates) {
            callback(window.currentRates);
        }
    }
};

// Auto-initialize
currencyRates.init();

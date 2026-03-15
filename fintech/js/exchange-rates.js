// Exchange Rate Service
class ExchangeRateService {
    constructor() {
        this.rates = {};
        this.baseCurrency = 'USD';
        this.updateInterval = 60000; // 1 minute
        this.listeners = [];
        this.init();
    }

    async init() {
        await this.fetchRates();
        this.startAutoUpdate();
        this.setupFirestoreSync();
    }

    async fetchRates() {
        try {
            // In production, use a real exchange rate API
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            this.rates = data.rates;
            this.notifyListeners();
            
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            // Fallback to Firestore cache
            await this.loadFromFirestore();
        }
    }

    async loadFromFirestore() {
        try {
            const doc = await db.collection('system').doc('exchangeRates').get();
            if (doc.exists) {
                this.rates = doc.data().rates;
                this.notifyListeners();
            }
        } catch (error) {
            console.error('Error loading rates from Firestore:', error);
        }
    }

    async setupFirestoreSync() {
        // Listen for rate updates from Firestore
        db.collection('system').doc('exchangeRates')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    this.rates = doc.data().rates;
                    this.notifyListeners();
                }
            });
    }

    startAutoUpdate() {
        setInterval(() => {
            this.fetchRates();
        }, this.updateInterval);
    }

    subscribe(listener) {
        this.listeners.push(listener);
        // Initial callback
        listener(this.rates);
    }

    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.rates));
    }

    convert(amount, fromCurrency, toCurrency) {
        if (!this.rates[fromCurrency] || !this.rates[toCurrency]) {
            throw new Error('Currency not supported');
        }

        // Convert to USD first (base)
        const usdAmount = amount / this.rates[fromCurrency];
        // Convert from USD to target currency
        const convertedAmount = usdAmount * this.rates[toCurrency];

        return {
            amount: convertedAmount,
            rate: this.rates[toCurrency] / this.rates[fromCurrency],
            timestamp: Date.now()
        };
    }

    getSupportedCurrencies() {
        return Object.keys(this.rates);
    }

    getRate(fromCurrency, toCurrency) {
        if (!this.rates[fromCurrency] || !this.rates[toCurrency]) {
            return null;
        }
        return this.rates[toCurrency] / this.rates[fromCurrency];
    }
}

// Initialize exchange rate service
const exchangeRates = new ExchangeRateService();

// Display exchange rates in UI
function displayExchangeRates(rates) {
    const container = document.getElementById('exchangeRates');
    if (!container) return;

    const majorPairs = ['EUR', 'GBP', 'JPY', 'CAD', 'CHF', 'AUD'];
    
    let html = '<div class="rates-grid">';
    majorPairs.forEach(currency => {
        if (rates[currency]) {
            html += `
                <div class="rate-card">
                    <span class="currency-pair">USD/${currency}</span>
                    <span class="rate-value">${rates[currency].toFixed(4)}</span>
                </div>
            `;
        }
    });
    html += '</div>';

    container.innerHTML = html;
}

// Update conversion preview
function updateConversionPreview() {
    const amount = document.getElementById('convertAmount')?.value;
    const from = document.getElementById('fromCurrency')?.value;
    const to = document.getElementById('toCurrency')?.value;

    if (amount && from && to) {
        try {
            const result = exchangeRates.convert(parseFloat(amount), from, to);
            document.getElementById('conversionResult').textContent = 
                `${result.amount.toFixed(2)} ${to}`;
            document.getElementById('exchangeRate').textContent = 
                `1 ${from} = ${result.rate.toFixed(4)} ${to}`;
        } catch (error) {
            console.error('Conversion error:', error);
        }
    }
}

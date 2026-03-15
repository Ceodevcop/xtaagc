// Card Details Page JavaScript
let currentCardId = null;
let currentUserId = null;
let unsubscribeTransactions = null;

document.addEventListener('DOMContentLoaded', () => {
    // Get card ID from URL
    const pathParts = window.location.pathname.split('/');
    currentCardId = pathParts[pathParts.length - 2]; // Cards ID from URL
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
            loadCardDetails();
            setupRealtimeListeners();
        } else {
            window.location.href = '/login/';
        }
    });

    // Setup tab switching
    setupTabs();
});

// Load card details from Firebase
async function loadCardDetails() {
    try {
        const cardRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.CARDS).doc(currentCardId);
        
        const cardDoc = await cardRef.get();
        
        if (!cardDoc.exists) {
            showToast('Card not found', 'error');
            setTimeout(() => window.location.href = '/cards/', 2000);
            return;
        }

        const card = cardDoc.data();
        displayCard(card);
        updateCardTitle(card);
        loadCardTransactions();
        loadMerchants();
        loadCardSettings(card);
        
    } catch (error) {
        console.error('Error loading card:', error);
        showToast('Error loading card details', 'error');
    }
}

// Display card in the UI
function displayCard(card) {
    const cardDisplay = document.getElementById('cardDisplay');
    const last4 = card.cardNumber?.slice(-4) || '****';
    const balance = formatCurrency(card.balance);
    const statusClass = card.status === 'frozen' ? 'frozen' : '';
    
    cardDisplay.innerHTML = `
        <div class="card large ${card.brand || 'visa'}-card ${statusClass}" data-card-id="${currentCardId}">
            <div class="card-header">
                <div>
                    <div class="card-label">Balance</div>
                    <div class="card-balance">${balance}</div>
                </div>
                <div class="card-status">${card.status}</div>
            </div>
            
            <div class="card-body">
                <div class="cardholder-name">${card.cardholderName || 'User'}</div>
                <div class="card-number">•••• •••• •••• ${last4}</div>
            </div>
            
            <div class="card-footer">
                <div>
                    <div class="card-label">Valid Thru</div>
                    <div class="card-expiry">${card.expiryMonth || '12'}/${card.expiryYear || '29'}</div>
                </div>
                <div class="card-cvv">CVV: •••</div>
            </div>
            
            <div class="card-brand">${card.brand === 'visa' ? 'VISA' : 'MASTERCARD'}</div>
            ${card.status === 'frozen' ? '<div class="frozen-overlay">❄️ FROZEN</div>' : ''}
        </div>
    `;

    // Update freeze button text
    document.getElementById('freezeBtnText').textContent = 
        card.status === 'frozen' ? 'Unfreeze' : 'Freeze';
}

// Update page title
function updateCardTitle(card) {
    const last4 = card.cardNumber?.slice(-4) || '****';
    document.getElementById('cardTitle').textContent = `Card ending in ${last4}`;
}

// Setup real-time listeners
function setupRealtimeListeners() {
    // Listen for card changes
    const cardRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
        .collection(COLLECTIONS.CARDS).doc(currentCardId);
    
    cardRef.onSnapshot((doc) => {
        if (doc.exists) {
            displayCard(doc.data());
        }
    });

    // Listen for new transactions
    if (unsubscribeTransactions) {
        unsubscribeTransactions();
    }

    const transactionsRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
        .collection(COLLECTIONS.TRANSACTIONS)
        .where('cardId', '==', currentCardId)
        .orderBy('createdAt', 'desc')
        .limit(20);

    unsubscribeTransactions = transactionsRef.onSnapshot((snapshot) => {
        displayTransactions(snapshot);
    });
}

// Load card transactions
async function loadCardTransactions() {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.TRANSACTIONS)
            .where('cardId', '==', currentCardId)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        displayTransactions(snapshot);
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Display transactions
function displayTransactions(snapshot) {
    const container = document.getElementById('cardTransactions');
    
    if (snapshot.empty) {
        container.innerHTML = '<div class="empty-state">No transactions yet</div>';
        return;
    }

    let html = '';
    snapshot.forEach((doc) => {
        const tx = doc.data();
        const date = tx.createdAt ? formatDate(tx.createdAt) : 'Just now';
        const amountClass = tx.amount > 0 ? 'credit' : 'debit';
        const amountPrefix = tx.amount > 0 ? '+' : '-';
        
        html += `
            <div class="transaction-item">
                <div class="transaction-icon">${tx.merchant ? tx.merchant.substring(0, 2) : 'TX'}</div>
                <div class="transaction-details">
                    <div class="transaction-description">${tx.description || 'Transaction'}</div>
                    <div class="transaction-date">${date}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}${formatCurrency(Math.abs(tx.amount))}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Load merchants
async function loadMerchants() {
    const container = document.getElementById('merchantsList');
    
    // Mock data - replace with actual merchant data from Firebase
    const merchants = [
        { name: 'Amazon.com', authorized: true, lastUsed: '2026-03-15' },
        { name: 'Netflix', authorized: true, lastUsed: '2026-03-14' },
        { name: 'Uber', authorized: false, lastUsed: '2026-03-10' },
        { name: 'Spotify', authorized: true, lastUsed: '2026-03-01' }
    ];

    let html = '';
    merchants.forEach(merchant => {
        html += `
            <div class="merchant-item">
                <div class="merchant-info">
                    <strong>${merchant.name}</strong>
                    <span class="merchant-date">Last used: ${merchant.lastUsed}</span>
                </div>
                <label class="switch">
                    <input type="checkbox" ${merchant.authorized ? 'checked' : ''} 
                           onchange="toggleMerchant('${merchant.name}', this.checked)">
                    <span class="slider"></span>
                </label>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Load card settings
function loadCardSettings(card) {
    document.getElementById('spendingLimit').value = card.spendingLimit || '';
    document.getElementById('cardNickname').value = card.nickname || '';
    document.getElementById('onlinePayments').checked = card.onlinePayments !== false;
    document.getElementById('internationalPayments').checked = card.internationalPayments !== false;
}

// Save card settings
async function saveCardSettings() {
    try {
        const updates = {
            spendingLimit: parseFloat(document.getElementById('spendingLimit').value) || null,
            nickname: document.getElementById('cardNickname').value,
            onlinePayments: document.getElementById('onlinePayments').checked,
            internationalPayments: document.getElementById('internationalPayments').checked,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.CARDS).doc(currentCardId)
            .update(updates);

        showToast('Settings saved successfully', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Error saving settings', 'error');
    }
}

// Fund card
async function fundCard() {
    const amount = prompt('Enter amount to fund:', '100');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        try {
            await db.collection(COLLECTIONS.USERS).doc(currentUserId)
                .collection(COLLECTIONS.CARDS).doc(currentCardId)
                .update({
                    balance: firebase.firestore.FieldValue.increment(parseFloat(amount))
                });

            await db.collection(COLLECTIONS.USERS).doc(currentUserId)
                .collection(COLLECTIONS.TRANSACTIONS).add({
                    type: 'fund',
                    amount: parseFloat(amount),
                    cardId: currentCardId,
                    description: 'Card funded',
                    status: 'completed',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            showToast(`Card funded with $${amount}`, 'success');
        } catch (error) {
            showToast('Failed to fund card', 'error');
        }
    }
}

// Withdraw from card
async function withdrawCard() {
    const amount = prompt('Enter amount to withdraw:', '50');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        try {
            const cardRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
                .collection(COLLECTIONS.CARDS).doc(currentCardId);
            
            const cardDoc = await cardRef.get();
            const currentBalance = cardDoc.data().balance || 0;
            
            if (currentBalance < parseFloat(amount)) {
                showToast('Insufficient balance', 'error');
                return;
            }

            await cardRef.update({
                balance: firebase.firestore.FieldValue.increment(-parseFloat(amount))
            });

            await db.collection(COLLECTIONS.USERS).doc(currentUserId)
                .collection(COLLECTIONS.TRANSACTIONS).add({
                    type: 'withdraw',
                    amount: parseFloat(amount),
                    cardId: currentCardId,
                    description: 'Card withdrawal',
                    status: 'completed',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            showToast(`Withdrawn $${amount} from card`, 'success');
        } catch (error) {
            showToast('Failed to withdraw', 'error');
        }
    }
}

// Toggle freeze
async function toggleFreeze() {
    try {
        const cardRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.CARDS).doc(currentCardId);
        
        const cardDoc = await cardRef.get();
        const currentStatus = cardDoc.data().status;
        const newStatus = currentStatus === 'active' ? 'frozen' : 'active';
        
        await cardRef.update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast(`Card ${newStatus === 'frozen' ? 'frozen' : 'unfrozen'}`, 'success');
    } catch (error) {
        showToast('Failed to update card status', 'error');
    }
}

// Toggle merchant authorization
async function toggleMerchant(merchantName, authorized) {
    try {
        const merchantRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.CARDS).doc(currentCardId)
            .collection('merchants').doc(merchantName);
        
        if (authorized) {
            await merchantRef.set({
                name: merchantName,
                authorized: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await merchantRef.delete();
        }

        showToast(`Merchant ${authorized ? 'authorized' : 'blocked'}`, 'success');
    } catch (error) {
        showToast('Error updating merchant', 'error');
    }
}

// Add new merchant
function addMerchant() {
    const merchantName = prompt('Enter merchant name:');
    if (merchantName) {
        toggleMerchant(merchantName, true);
    }
}

// Show card details (full number, CVV)
function showCardDetails() {
    // In production, this would fetch and display sensitive data securely
    alert('For security reasons, full card details are not displayed. Use the app for transactions.');
}

// Show QR code for wallet
function showQRCode() {
    document.getElementById('qrModal').style.display = 'block';
    generateQRCode();
}

// Generate QR code
function generateQRCode() {
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '<div class="qr-placeholder">📱 Scan to add to wallet</div>';
}

// Close modal
function closeModal() {
    document.getElementById('qrModal').style.display = 'none';
}

// Download statement
function downloadStatement() {
    showToast('Generating statement...', 'info');
    setTimeout(() => {
        showToast('Statement ready for download', 'success');
    }, 2000);
}

// Report lost/stolen card
function reportLostCard() {
    if (confirm('Are you sure you want to report this card as lost/stolen? This will permanently block the card.')) {
        showToast('Card reported. A replacement will be issued.', 'success');
    }
}

// Setup tabs
function setupTabs() {
    window.switchTab = function(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName + 'Tab').classList.add('active');
        event.target.classList.add('active');
    };
}

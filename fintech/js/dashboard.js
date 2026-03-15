// Dashboard functionality
let currentUserId = null;
let unsubscribeCards = null;
let unsubscribeTransactions = null;
let showBalance = true;

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
            loadDashboardData(user.uid);
            setupRealtimeListeners(user.uid);
        } else {
            window.location.href = '/login/';
        }
    });

    // Toggle balance visibility
    const toggleBtn = document.getElementById('toggleBalance');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleBalanceVisibility);
    }

    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadStatement);
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = '/settings/';
        });
    }
});

// Load initial dashboard data
async function loadDashboardData(userId) {
    try {
        // Load user data
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
        if (userDoc.exists) {
            updateUserInterface(userDoc.data());
        }

        // Load cards
        await loadCards(userId);

        // Load recent transactions
        await loadRecentTransactions(userId);

        // Load total balance
        await loadTotalBalance(userId);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// Setup real-time listeners
function setupRealtimeListeners(userId) {
    // Listen for card changes
    if (unsubscribeCards) {
        unsubscribeCards();
    }

    unsubscribeCards = db.collection(COLLECTIONS.USERS).doc(userId)
        .collection(COLLECTIONS.CARDS)
        .where('status', 'in', ['active', 'frozen'])
        .onSnapshot((snapshot) => {
            updateCardsGrid(snapshot);
            loadTotalBalance(userId);
        }, (error) => {
            console.error('Cards listener error:', error);
        });

    // Listen for recent transactions
    if (unsubscribeTransactions) {
        unsubscribeTransactions();
    }

    unsubscribeTransactions = db.collection(COLLECTIONS.USERS).doc(userId)
        .collection(COLLECTIONS.TRANSACTIONS)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .onSnapshot((snapshot) => {
            updateTransactionsList(snapshot);
        }, (error) => {
            console.error('Transactions listener error:', error);
        });
}

// Load cards from Firebase
async function loadCards(userId) {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).doc(userId)
            .collection(COLLECTIONS.CARDS)
            .where('status', 'in', ['active', 'frozen'])
            .get();

        updateCardsGrid(snapshot);
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

// Update cards grid with data
function updateCardsGrid(snapshot) {
    const cardsGrid = document.getElementById('cardsGrid');
    if (!cardsGrid) return;

    if (snapshot.empty) {
        // Show empty state
        cardsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💳</div>
                <h3>No cards yet</h3>
                <p>Create your first virtual card to get started</p>
                <a href="/card-issue/" class="btn btn-primary">Create Card</a>
            </div>
        `;
        return;
    }

    let html = '';
    snapshot.forEach((doc) => {
        const card = doc.data();
        card.id = doc.id;
        html += createCardHTML(card);
    });

    // Add "Add New Card" button
    html += `
        <div class="add-card" onclick="window.location.href='/card-issue/'">
            <div class="add-card-icon">+</div>
            <h3>+ Add New Card</h3>
            <p>Create a new virtual USD card</p>
        </div>
    `;

    cardsGrid.innerHTML = html;

    // Attach menu listeners to new cards
    attachCardMenuListeners();
}

// Create HTML for a card
function createCardHTML(card) {
    const balance = showBalance ? formatCurrency(card.balance) : '••••••';
    const last4 = card.cardNumber?.slice(-4) || '****';
    const statusClass = card.status === 'frozen' ? 'frozen' : 'active';
    const cardBrand = card.brand || 'visa';
    
    return `
        <div class="card-container" data-card-id="${card.id}">
            <div class="card ${cardBrand}-card ${statusClass}">
                <div class="card-header">
                    <div>
                        <div class="card-label">Balance</div>
                        <div class="card-balance">${balance}</div>
                    </div>
                    <button class="card-menu-btn" onclick="event.stopPropagation(); toggleCardMenu('${card.id}')">⋮</button>
                </div>
                
                <div class="card-body">
                    <div class="cardholder-name">${card.cardholderName || 'User'}</div>
                    <div class="card-number">************* ${last4}</div>
                </div>
                
                <div class="card-footer">
                    <div>
                        <div class="card-label">Valid Thru</div>
                        <div class="card-expiry">${card.expiryMonth || '12'}/${card.expiryYear || '29'}</div>
                    </div>
                    <div class="card-actions">
                        <button class="card-action" onclick="event.stopPropagation(); addToWallet('${card.id}')" title="Add to Wallet">💳</button>
                        <button class="card-action" onclick="event.stopPropagation(); copyCardNumber('${card.cardNumber}')" title="Copy Number">📋</button>
                    </div>
                </div>
                
                <div class="card-brand">${cardBrand === 'visa' ? 'VISA' : ''}</div>
                
                <!-- Card Menu -->
                <div class="card-menu" id="menu-${card.id}" style="display: none;">
                    <button class="menu-item" onclick="window.location.href='/cards/${card.id}/'">
                        <span>📋</span> Card Details
                    </button>
                    <button class="menu-item" onclick="fundCard('${card.id}')">
                        <span>💰</span> Fund Card
                    </button>
                    <button class="menu-item" onclick="withdrawCard('${card.id}')">
                        <span>💸</span> Withdraw
                    </button>
                    <button class="menu-item" onclick="manageMerchants('${card.id}')">
                        <span>🏪</span> Manage Merchants
                    </button>
                    <button class="menu-item" onclick="generateStatement('${card.id}')">
                        <span>📄</span> Generate Statement
                    </button>
                    <button class="menu-item" onclick="toggleFreeze('${card.id}')">
                        <span>❄️</span> ${card.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load total balance
async function loadTotalBalance(userId) {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).doc(userId)
            .collection(COLLECTIONS.CARDS)
            .where('status', '==', 'active')
            .get();

        let total = 0;
        snapshot.forEach((doc) => {
            total += doc.data().balance || 0;
        });

        const totalBalanceEl = document.getElementById('totalBalance');
        if (totalBalanceEl) {
            totalBalanceEl.textContent = formatCurrency(total);
        }

        // Update total balance card
        const totalCard = document.getElementById('totalBalanceCard');
        if (totalCard) {
            totalCard.style.display = 'block';
        }

    } catch (error) {
        console.error('Error loading total balance:', error);
    }
}

// Load recent transactions
async function loadRecentTransactions(userId) {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).doc(userId)
            .collection(COLLECTIONS.TRANSACTIONS)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        updateTransactionsList(snapshot);
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Update transactions list
function updateTransactionsList(snapshot) {
    const transactionList = document.getElementById('transactionList');
    if (!transactionList) return;

    if (snapshot.empty) {
        transactionList.innerHTML = `
            <div class="empty-transactions">
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }

    let html = '';
    snapshot.forEach((doc) => {
        const tx = doc.data();
        tx.id = doc.id;
        html += createTransactionHTML(tx);
    });

    transactionList.innerHTML = html;
}

// Create HTML for a transaction
function createTransactionHTML(tx) {
    const date = tx.createdAt ? formatDate(tx.createdAt) : 'Just now';
    const amountClass = tx.type === 'credit' || tx.type === 'fund' ? 'credit' : 'debit';
    const amountPrefix = tx.type === 'credit' || tx.type === 'fund' ? '+' : '-';
    
    return `
        <div class="transaction-item" onclick="window.location.href='/transactions/${tx.id}/'">
            <div class="transaction-icon">
                ${tx.merchant ? tx.merchant.substring(0, 2) : 'TX'}
            </div>
            <div class="transaction-details">
                <div class="transaction-description">${tx.description || 'Transaction'}</div>
                <div class="transaction-date">${date}</div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountPrefix}${formatCurrency(tx.amount)}
            </div>
        </div>
    `;
}

// Toggle balance visibility
function toggleBalanceVisibility() {
    showBalance = !showBalance;
    const toggleBtn = document.getElementById('toggleBalance');
    toggleBtn.innerHTML = showBalance ? '<span class="icon">👁️</span>' : '<span class="icon">👁️‍🗨️</span>';
    
    // Reload cards with new visibility
    loadCards(currentUserId);
}

// Toggle card menu
function toggleCardMenu(cardId) {
    const menu = document.getElementById(`menu-${cardId}`);
    if (menu) {
        const isVisible = menu.style.display === 'block';
        
        // Hide all other menus
        document.querySelectorAll('.card-menu').forEach(m => m.style.display = 'none');
        
        // Show/hide this menu
        menu.style.display = isVisible ? 'none' : 'block';
    }
}

// Copy card number
function copyCardNumber(cardNumber) {
    navigator.clipboard.writeText(cardNumber).then(() => {
        showToast('Card number copied!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// Add to wallet
async function addToWallet(cardId) {
    showToast('Added to digital wallet', 'success');
}

// Fund card
async function fundCard(cardId) {
    const amount = prompt('Enter amount to fund:', '100');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        try {
            await db.collection(COLLECTIONS.USERS).doc(currentUserId)
                .collection(COLLECTIONS.CARDS).doc(cardId)
                .update({
                    balance: firebase.firestore.FieldValue.increment(parseFloat(amount))
                });

            await db.collection(COLLECTIONS.USERS).doc(currentUserId)
                .collection(COLLECTIONS.TRANSACTIONS).add({
                    type: 'fund',
                    amount: parseFloat(amount),
                    cardId: cardId,
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
async function withdrawCard(cardId) {
    const amount = prompt('Enter amount to withdraw:', '50');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        try {
            const cardRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
                .collection(COLLECTIONS.CARDS).doc(cardId);
            
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
                    cardId: cardId,
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
async function toggleFreeze(cardId) {
    try {
        const cardRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.CARDS).doc(cardId);
        
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

// Manage merchants
function manageMerchants(cardId) {
    window.location.href = `/cards/${cardId}/merchants`;
}

// Generate statement
function generateStatement(cardId) {
    window.location.href = `/cards/${cardId}/statement`;
}

// Download statement
function downloadStatement() {
    showToast('Generating statement...', 'info');
    setTimeout(() => {
        showToast('Statement ready for download', 'success');
    }, 2000);
}

// Attach menu listeners
function attachCardMenuListeners() {
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card-menu-btn') && !e.target.closest('.card-menu')) {
            document.querySelectorAll('.card-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
}

// Clean up listeners on page unload
window.addEventListener('beforeunload', () => {
    if (unsubscribeCards) unsubscribeCards();
    if (unsubscribeTransactions) unsubscribeTransactions();
});

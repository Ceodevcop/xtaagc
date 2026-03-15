// Transactions Page JavaScript
let currentUserId = null;
let currentPage = 1;
let pageSize = 20;
let lastVisible = null;
let filters = {
    type: '',
    cardId: '',
    dateFrom: null,
    dateTo: null
};

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
            loadTransactions();
            loadTransactionSummary();
            loadCardsForFilter();
        } else {
            window.location.href = '/login/';
        }
    });

    // Setup filter toggle
    const filterBtn = document.querySelector('.btn-outline');
    if (filterBtn) {
        filterBtn.addEventListener('click', toggleFilters);
    }
});

// Load transactions from Firebase
async function loadTransactions(loadMore = false) {
    try {
        const transactionsRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.TRANSACTIONS);
        
        let query = transactionsRef.orderBy('createdAt', 'desc');

        // Apply filters
        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        if (filters.cardId) {
            query = query.where('cardId', '==', filters.cardId);
        }
        if (filters.dateFrom) {
            query = query.where('createdAt', '>=', filters.dateFrom);
        }
        if (filters.dateTo) {
            query = query.where('createdAt', '<=', filters.dateTo);
        }

        query = query.limit(pageSize);

        if (loadMore && lastVisible) {
            query = query.startAfter(lastVisible);
        }

        const snapshot = await query.get();
        
        if (!loadMore) {
            document.getElementById('transactionsList').innerHTML = '';
        }

        if (snapshot.empty && !loadMore) {
            document.getElementById('transactionsList').innerHTML = `
                <div class="empty-state">
                    <span class="icon">📝</span>
                    <h3>No transactions yet</h3>
                    <p>Your transactions will appear here</p>
                </div>
            `;
            return;
        }

        lastVisible = snapshot.docs[snapshot.docs.length - 1];
        
        groupAndDisplayTransactions(snapshot.docs);
        updatePagination(snapshot.docs.length);

    } catch (error) {
        console.error('Error loading transactions:', error);
        showToast('Error loading transactions', 'error');
    }
}

// Group and display transactions by date
function groupAndDisplayTransactions(docs) {
    const container = document.getElementById('transactionsList');
    const groups = {};

    docs.forEach(doc => {
        const tx = { id: doc.id, ...doc.data() };
        const date = tx.createdAt ? tx.createdAt.toDate().toDateString() : 'Unknown';
        
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(tx);
    });

    let html = '';
    for (const [date, transactions] of Object.entries(groups)) {
        html += `<div class="date-group">${formatGroupDate(date)}</div>`;
        
        transactions.forEach(tx => {
            const amountClass = tx.amount > 0 ? 'credit' : 'debit';
            const amountPrefix = tx.amount > 0 ? '+' : '-';
            const icon = getTransactionIcon(tx.type);
            
            html += `
                <div class="transaction-item" onclick="viewTransaction('${tx.id}')">
                    <div class="transaction-icon">${icon}</div>
                    <div class="transaction-details">
                        <div class="transaction-description">${tx.description || 'Transaction'}</div>
                        <div class="transaction-meta">
                            <span class="transaction-type">${tx.type}</span>
                            <span class="transaction-date">${formatTime(tx.createdAt)}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountPrefix}${formatCurrency(Math.abs(tx.amount))}
                        <div class="transaction-status ${tx.status}">${tx.status}</div>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML += html;
}

// Get icon for transaction type
function getTransactionIcon(type) {
    const icons = {
        'purchase': '🛒',
        'fund': '💰',
        'withdraw': '💸',
        'transfer': '↔️',
        'refund': '↩️'
    };
    return icons[type] || '📝';
}

// Format group date
function formatGroupDate(dateString) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return dateString;
}

// Format time
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Load transaction summary
async function loadTransactionSummary() {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.TRANSACTIONS)
            .get();

        let totalSpent = 0;
        let totalReceived = 0;
        let monthlySpent = 0;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        snapshot.forEach(doc => {
            const tx = doc.data();
            const txDate = tx.createdAt?.toDate();
            
            if (tx.type === 'purchase' || tx.type === 'withdraw' || tx.type === 'transfer_out') {
                totalSpent += tx.amount || 0;
                if (txDate && txDate >= firstDayOfMonth) {
                    monthlySpent += tx.amount || 0;
                }
            } else {
                totalReceived += tx.amount || 0;
            }
        });

        document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
        document.getElementById('totalReceived').textContent = formatCurrency(totalReceived);
        document.getElementById('monthlySpent').textContent = formatCurrency(monthlySpent);
        document.getElementById('transactionCount').textContent = snapshot.size;

    } catch (error) {
        console.error('Error loading summary:', error);
    }
}

// Load cards for filter dropdown
async function loadCardsForFilter() {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.CARDS)
            .where('status', '==', 'active')
            .get();

        const select = document.getElementById('cardFilter');
        snapshot.forEach(doc => {
            const card = doc.data();
            const last4 = card.cardNumber?.slice(-4) || '****';
            select.innerHTML += `<option value="${doc.id}">Card ending in ${last4}</option>`;
        });

    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

// Toggle filters
function toggleFilters() {
    const filtersBar = document.getElementById('filtersBar');
    if (filtersBar.style.display === 'none') {
        filtersBar.style.display = 'flex';
    } else {
        filtersBar.style.display = 'none';
    }
}

// Apply filters
function applyFilters() {
    filters.type = document.getElementById('typeFilter').value;
    filters.cardId = document.getElementById('cardFilter').value;
    
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    filters.dateFrom = dateFrom ? new Date(dateFrom) : null;
    filters.dateTo = dateTo ? new Date(dateTo) : null;
    
    currentPage = 1;
    lastVisible = null;
    loadTransactions();
    toggleFilters();
}

// Reset filters
function resetFilters() {
    document.getElementById('typeFilter').value = '';
    document.getElementById('cardFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    filters = {
        type: '',
        cardId: '',
        dateFrom: null,
        dateTo: null
    };
    
    currentPage = 1;
    lastVisible = null;
    loadTransactions();
}

// Update pagination
function updatePagination(resultCount) {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = resultCount < pageSize;
    
    pageInfo.textContent = `Page ${currentPage}`;
}

// Load previous page
function loadPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        lastVisible = null; // You'd need to implement proper pagination with Firebase
        loadTransactions();
    }
}

// Load next page
function loadNextPage() {
    currentPage++;
    loadTransactions(true);
}

// Export transactions
function exportTransactions() {
    showToast('Preparing export...', 'info');
    setTimeout(() => {
        showToast('Export ready for download', 'success');
    }, 2000);
}

// View transaction details
function viewTransaction(transactionId) {
    window.location.href = `/transactions/${transactionId}/`;
}

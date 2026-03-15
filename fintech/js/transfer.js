// Transfer Page JavaScript
let currentUserId = null;
let exchangeRates = {};

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
            loadCards();
            loadBeneficiaries();
            loadExchangeRates();
        } else {
            window.location.href = '/login/';
        }
    });

    // Setup amount listeners
    document.getElementById('amount')?.addEventListener('input', updateTransferSummary);
    document.getElementById('fromCard')?.addEventListener('change', updateAvailableBalance);
    document.getElementById('sendAmount')?.addEventListener('input', updateRecipientAmount);
    document.getElementById('fromCurrency')?.addEventListener('change', updateRecipientAmount);
    document.getElementById('toCurrency')?.addEventListener('change', updateRecipientAmount);

    // Setup tab switching
    setupTransferTabs();
});

// Load user's cards
async function loadCards() {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.CARDS)
            .where('status', '==', 'active')
            .get();

        const select = document.getElementById('fromCard');
        snapshot.forEach(doc => {
            const card = doc.data();
            const last4 = card.cardNumber?.slice(-4) || '****';
            select.innerHTML += `<option value="${doc.id}" data-balance="${card.balance || 0}">
                Card ending in ${last4} - ${formatCurrency(card.balance || 0)}
            </option>`;
        });

    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

// Load beneficiaries
async function loadBeneficiaries() {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection('beneficiaries')
            .orderBy('name')
            .get();

        const select = document.getElementById('beneficiarySelect');
        const listContainer = document.getElementById('beneficiariesList');

        let options = '<option value="">Choose beneficiary</option>';
        let listHtml = '';

        snapshot.forEach(doc => {
            const beneficiary = doc.data();
            options += `<option value="${doc.id}">${beneficiary.name}</option>`;
            
            listHtml += `
                <div class="beneficiary-card" onclick="selectBeneficiary('${doc.id}')">
                    <div class="beneficiary-avatar">${beneficiary.name.charAt(0)}</div>
                    <div class="beneficiary-info">
                        <div class="beneficiary-name">${beneficiary.name}</div>
                        <div class="beneficiary-detail">${beneficiary.email || beneficiary.phone}</div>
                    </div>
                    <button class="btn-icon" onclick="deleteBeneficiary('${doc.id}', event)">🗑️</button>
                </div>
            `;
        });

        if (select) select.innerHTML = options;
        if (listContainer) {
            if (snapshot.empty) {
                listContainer.innerHTML = '<div class="empty-state">No beneficiaries added yet</div>';
            } else {
                listContainer.innerHTML = listHtml;
            }
        }

    } catch (error) {
        console.error('Error loading beneficiaries:', error);
    }
}

// Load exchange rates
async function loadExchangeRates() {
    try {
        // In production, fetch from a real exchange rate API
        exchangeRates = {
            'USD': { 'EUR': 0.92, 'GBP': 0.79, 'JPY': 150.50 },
            'EUR': { 'USD': 1.09, 'GBP': 0.86, 'JPY': 163.50 },
            'GBP': { 'USD': 1.27, 'EUR': 1.16, 'JPY': 190.20 }
        };

        displayExchangeRates();
    } catch (error) {
        console.error('Error loading exchange rates:', error);
    }
}

// Display exchange rates
function displayExchangeRates() {
    const container = document.getElementById('exchangeRates');
    if (!container) return;

    let html = '<div class="rates-grid">';
    for (const [from, rates] of Object.entries(exchangeRates)) {
        for (const [to, rate] of Object.entries(rates)) {
            html += `
                <div class="rate-card">
                    <span class="rate-pair">${from}/${to}</span>
                    <span class="rate-value">${rate.toFixed(4)}</span>
                </div>
            `;
        }
    }
    html += '</div>';
    container.innerHTML = html;
}

// Update available balance when card selected
function updateAvailableBalance() {
    const select = document.getElementById('fromCard');
    const selected = select.options[select.selectedIndex];
    const balance = selected?.dataset?.balance || 0;
    
    document.getElementById('availableBalance').textContent = formatCurrency(balance);
    updateTransferSummary();
}

// Update transfer summary
function updateTransferSummary() {
    const amount = parseFloat(document.getElementById('amount')?.value) || 0;
    const fee = calculateFee(amount);
    const total = amount + fee;

    document.getElementById('summaryAmount').textContent = formatCurrency(amount);
    document.getElementById('summaryFee').textContent = formatCurrency(fee);
    document.getElementById('summaryTotal').textContent = formatCurrency(total);
}

// Calculate transfer fee
function calculateFee(amount) {
    if (amount <= 0) return 0;
    // Simple fee structure: 1% or $1 minimum
    return Math.max(amount * 0.01, 1);
}

// Update recipient amount for international transfer
function updateRecipientAmount() {
    const fromAmount = parseFloat(document.getElementById('sendAmount')?.value) || 0;
    const fromCurrency = document.getElementById('fromCurrency')?.value;
    const toCurrency = document.getElementById('toCurrency')?.value;

    if (fromAmount && fromCurrency && toCurrency && exchangeRates[fromCurrency]) {
        const rate = exchangeRates[fromCurrency][toCurrency] || 1;
        const recipientAmount = fromAmount * rate;
        
        document.getElementById('recipientAmount').textContent = 
            formatCurrency(recipientAmount, toCurrency);
    }
}

// Handle internal transfer
async function handleTransfer(event) {
    event.preventDefault();

    const fromCard = document.getElementById('fromCard').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const recipientType = document.getElementById('recipientType').value;

    let toUserId, toCard;

    if (recipientType === 'existing') {
        const beneficiaryId = document.getElementById('beneficiarySelect').value;
        if (!beneficiaryId) {
            showToast('Please select a beneficiary', 'error');
            return;
        }
        // Get beneficiary details from Firestore
        // toUserId = beneficiary.userId;
    } else {
        const recipientName = document.getElementById('recipientName').value;
        const recipientEmail = document.getElementById('recipientEmail').value;
        
        if (!recipientName || !recipientEmail) {
            showToast('Please enter recipient details', 'error');
            return;
        }
        // Find user by email and create beneficiary
    }

    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }

    try {
        const transferBtn = document.getElementById('transferBtn');
        transferBtn.disabled = true;
        transferBtn.textContent = 'Processing...';

        // In production, this would be a Firebase Function
        await processTransfer(fromCard, toCard, amount, description);
        
        showToast('Transfer completed successfully', 'success');
        setTimeout(() => {
            window.location.href = '/transactions/';
        }, 2000);

    } catch (error) {
        console.error('Transfer error:', error);
        showToast('Transfer failed: ' + error.message, 'error');
        
        const transferBtn = document.getElementById('transferBtn');
        transferBtn.disabled = false;
        transferBtn.textContent = 'Send Money';
    }
}

// Process transfer (would be a Firebase Function)
async function processTransfer(fromCard, toCard, amount, description) {
    // This is a simplified version - in production, use a Firebase Function
    // to ensure atomic operations and prevent race conditions
    
    const fromCardRef = db.collection(COLLECTIONS.USERS).doc(currentUserId)
        .collection(COLLECTIONS.CARDS).doc(fromCard);
    
    const fromCardDoc = await fromCardRef.get();
    const fromBalance = fromCardDoc.data().balance || 0;

    if (fromBalance < amount) {
        throw new Error('Insufficient balance');
    }

    // Update sender's card
    await fromCardRef.update({
        balance: firebase.firestore.FieldValue.increment(-amount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Create transaction record
    await db.collection(COLLECTIONS.USERS).doc(currentUserId)
        .collection(COLLECTIONS.TRANSACTIONS).add({
            type: 'transfer_out',
            amount: amount,
            description: description || 'Transfer',
            status: 'completed',
            toCard: toCard,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

    // In production, this would also update the recipient's balance
    // and create a transaction for them
}

// Handle international transfer
async function handleInternationalTransfer(event) {
    event.preventDefault();
    showToast('International transfers coming soon!', 'info');
}

// Toggle recipient input
function toggleRecipientInput() {
    const type = document.getElementById('recipientType').value;
    const existingDiv = document.getElementById('existingRecipient');
    const newDiv = document.getElementById('newRecipient');

    if (type === 'existing') {
        existingDiv.style.display = 'block';
        newDiv.style.display = 'none';
    } else {
        existingDiv.style.display = 'none';
        newDiv.style.display = 'block';
    }
}

// Show add beneficiary modal
function showAddBeneficiary() {
    document.getElementById('beneficiaryModal').style.display = 'block';
}

// Add beneficiary
async function addBeneficiary(event) {
    event.preventDefault();

    const form = event.target;
    const name = form.querySelector('input[placeholder="Full Name"]').value;
    const email = form.querySelector('input[placeholder="Email"]').value;
    const bank = form.querySelector('input[placeholder="Bank Name"]').value;
    const account = form.querySelector('input[placeholder="Account Number"]').value;

    try {
        await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection('beneficiaries').add({
                name,
                email,
                bank,
                account,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        showToast('Beneficiary added successfully', 'success');
        document.getElementById('beneficiaryModal').style.display = 'none';
        loadBeneficiaries();

    } catch (error) {
        console.error('Error adding beneficiary:', error);
        showToast('Error adding beneficiary', 'error');
    }
}

// Select beneficiary
function selectBeneficiary(beneficiaryId) {
    document.getElementById('recipientType').value = 'existing';
    document.getElementById('existingRecipient').style.display = 'block';
    document.getElementById('newRecipient').style.display = 'none';
    document.getElementById('beneficiarySelect').value = beneficiaryId;
}

// Delete beneficiary
async function deleteBeneficiary(beneficiaryId, event) {
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this beneficiary?')) {
        try {
            await db.collection(COLLECTIONS.USERS).doc(currentUserId)
                .collection('beneficiaries').doc(beneficiaryId).delete();

            showToast('Beneficiary deleted', 'success');
            loadBeneficiaries();

        } catch (error) {
            console.error('Error deleting beneficiary:', error);
            showToast('Error deleting beneficiary', 'error');
        }
    }
}

// Setup transfer tabs
function setupTransferTabs() {
    window.switchTransferTab = function(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-pane').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName + 'Transfer').classList.add('active');
        event.target.classList.add('active');
    };
}

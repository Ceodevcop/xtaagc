// Settings Page JavaScript
let currentUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
            loadSettings();
            loadLimits();
            loadDevices();
            loadWebhooks();
        } else {
            window.location.href = '/login/';
        }
    });

    // Setup settings navigation
    setupSettingsNavigation();
});

// Load settings
async function loadSettings() {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(currentUserId).get();
        
        if (userDoc.exists) {
            const data = userDoc.data();

            // Load account info
            document.getElementById('memberSince').textContent = 
                data.metadata?.createdAt ? formatDate(data.metadata.createdAt) : 'N/A';
            
            // Load notification preferences
            document.getElementById('marketingEmails').checked = data.preferences?.marketingEmails !== false;
            document.getElementById('transactionEmails').checked = data.preferences?.transactionEmails !== false;
            document.getElementById('securityEmails').checked = true; // Always enabled

            // Load API key (mock)
            document.getElementById('apiKey').textContent = generateMockApiKey();
        }

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Load account limits
async function loadLimits() {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(currentUserId).get();
        const kycLevel = userDoc.data()?.kyc?.level || 0;

        // Set limits based on KYC level
        const limits = {
            0: { daily: 1000, monthly: 5000, card: 1000, withdrawal: 500 },
            1: { daily: 5000, monthly: 25000, card: 5000, withdrawal: 2000 },
            2: { daily: 10000, monthly: 50000, card: 10000, withdrawal: 5000 },
            3: { daily: 50000, monthly: 250000, card: 25000, withdrawal: 10000 }
        };

        const userLimits = limits[kycLevel] || limits[0];

        document.getElementById('dailyLimit').textContent = formatCurrency(userLimits.daily);
        document.getElementById('monthlyLimit').textContent = formatCurrency(userLimits.monthly);
        document.getElementById('cardLimit').textContent = formatCurrency(userLimits.card);
        document.getElementById('withdrawalLimit').textContent = formatCurrency(userLimits.withdrawal);

        // Load used amounts (would come from transactions in production)
        document.getElementById('dailyUsed').textContent = '$0 used today';
        document.getElementById('monthlyUsed').textContent = '$0 used this month';

    } catch (error) {
        console.error('Error loading limits:', error);
    }
}

// Load devices
async function loadDevices() {
    const devicesList = document.getElementById('devicesList');
    
    // Mock data - would come from Firebase Auth in production
    const devices = [
        { name: 'Chrome on Windows', lastActive: 'Now', current: true },
        { name: 'Safari on iPhone', lastActive: '2 hours ago', current: false },
        { name: 'Firefox on Mac', lastActive: '3 days ago', current: false }
    ];

    let html = '';
    devices.forEach(device => {
        html += `
            <div class="device-item ${device.current ? 'current' : ''}">
                <div class="device-info">
                    <strong>${device.name}</strong>
                    <span>Last active: ${device.lastActive}</span>
                </div>
                ${device.current ? '<span class="badge success">Current</span>' : ''}
            </div>
        `;
    });

    devicesList.innerHTML = html;
}

// Load webhooks
async function loadWebhooks() {
    const webhooksList = document.getElementById('webhooksList');
    
    // Mock data
    const webhooks = [
        { url: 'https://api.example.com/webhook1', events: ['payment.success', 'payment.failed'] },
        { url: 'https://api.example.com/webhook2', events: ['card.created', 'card.frozen'] }
    ];

    if (webhooks.length === 0) {
        webhooksList.innerHTML = '<div class="empty-state">No webhooks configured</div>';
        return;
    }

    let html = '';
    webhooks.forEach(webhook => {
        html += `
            <div class="webhook-item">
                <div class="webhook-url">${webhook.url}</div>
                <div class="webhook-events">${webhook.events.join(', ')}</div>
                <button class="btn-icon" onclick="deleteWebhook('${webhook.url}')">🗑️</button>
            </div>
        `;
    });

    webhooksList.innerHTML = html;
}

// Show settings section
function showSettingsSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav items
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId + 'Section').classList.add('active');
    event.target.classList.add('active');
}

// Change password modal
function changePassword() {
    document.getElementById('passwordModal').style.display = 'block';
}

// Setup 2FA
function setupTwoFA() {
    showToast('2FA setup coming soon!', 'info');
}

// Confirm delete account
function confirmDeleteAccount() {
    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
        deleteAccount();
    }
}

// Delete account
async function deleteAccount() {
    try {
        showToast('Processing account deletion...', 'info');
        
        // Delete user data from Firestore
        await db.collection(COLLECTIONS.USERS).doc(currentUserId).delete();
        
        // Delete Firebase Auth user
        await auth.currentUser.delete();
        
        showToast('Account deleted successfully', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);

    } catch (error) {
        console.error('Error deleting account:', error);
        showToast('Error deleting account. Please contact support.', 'error');
    }
}

// Generate new API key
function generateNewApiKey() {
    if (confirm('Generating a new API key will invalidate the old one. Continue?')) {
        const newKey = generateMockApiKey();
        document.getElementById('apiKey').textContent = newKey;
        showToast('New API key generated', 'success');
    }
}

// Copy API key
function copyApiKey() {
    const apiKey = document.getElementById('apiKey').textContent;
    navigator.clipboard.writeText(apiKey).then(() => {
        showToast('API key copied!', 'success');
    });
}

// Add webhook
function addWebhook() {
    const url = prompt('Enter webhook URL:');
    if (url) {
        showToast('Webhook added successfully', 'success');
    }
}

// Delete webhook
function deleteWebhook(url) {
    if (confirm(`Delete webhook ${url}?`)) {
        showToast('Webhook deleted', 'success');
    }
}

// Manage devices
function manageDevices() {
    showToast('Device management coming soon', 'info');
}

// View all logins
function viewAllLogins() {
    showToast('Viewing all login history', 'info');
}

// Adjust card limits
function adjustCardLimits() {
    showToast('Card limit adjustment coming soon', 'info');
}

// Adjust withdrawal limits
function adjustWithdrawalLimits() {
    showToast('Withdrawal limit adjustment coming soon', 'info');
}

// Generate mock API key
function generateMockApiKey() {
    return 'taagc_' + Math.random().toString(36).substr(2, 32);
}

// Setup settings navigation
function setupSettingsNavigation() {
    // Show first section by default
    document.querySelector('.settings-section')?.classList.add('active');
}

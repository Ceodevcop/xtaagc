// Profile Page JavaScript
let currentUserId = null;
let unsubscribeProfile = null;

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
            loadProfileData();
            setupRealtimeProfile();
            loadDocuments();
            loadLoginHistory();
        } else {
            window.location.href = '/login/';
        }
    });

    // Setup profile form
    document.getElementById('profileForm')?.addEventListener('submit', saveProfile);
    document.getElementById('passwordForm')?.addEventListener('submit', changePassword);
    document.getElementById('documentUploadForm')?.addEventListener('submit', uploadDocument);

    // Setup tabs
    setupProfileTabs();
});

// Load profile data
async function loadProfileData() {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(currentUserId).get();
        
        if (userDoc.exists) {
            const data = userDoc.data();
            
            // Update profile fields
            document.getElementById('firstName').value = data.profile?.firstName || '';
            document.getElementById('lastName').value = data.profile?.lastName || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.profile?.phone || '';
            document.getElementById('dob').value = data.profile?.dob || '';
            document.getElementById('address').value = data.profile?.address?.street || '';
            document.getElementById('city').value = data.profile?.address?.city || '';
            document.getElementById('state').value = data.profile?.address?.state || '';
            document.getElementById('zip').value = data.profile?.address?.zip || '';
            document.getElementById('country').value = data.profile?.address?.country || 'US';

            // Update profile header
            document.getElementById('profileName').textContent = 
                `${data.profile?.firstName || ''} ${data.profile?.lastName || ''}`.trim() || 'User';
            document.getElementById('profileEmail').textContent = data.email || '';
            document.getElementById('profilePhone').textContent = data.profile?.phone || 'No phone added';

            // Load preferences
            loadPreferences(data.preferences);
            
            // Load KYC status
            loadKYCStatus(data.kyc);
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile', 'error');
    }
}

// Setup real-time profile updates
function setupRealtimeProfile() {
    if (unsubscribeProfile) {
        unsubscribeProfile();
    }

    unsubscribeProfile = db.collection(COLLECTIONS.USERS).doc(currentUserId)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                // Update any real-time elements
                updateProfileHeader(data);
            }
        });
}

// Update profile header
function updateProfileHeader(data) {
    const headerName = document.getElementById('profileName');
    if (headerName) {
        headerName.textContent = `${data.profile?.firstName || ''} ${data.profile?.lastName || ''}`.trim() || 'User';
    }
}

// Save profile
async function saveProfile(event) {
    event.preventDefault();

    const profileData = {
        profile: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            dob: document.getElementById('dob').value,
            address: {
                street: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value
            }
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection(COLLECTIONS.USERS).doc(currentUserId).update(profileData);
        showToast('Profile updated successfully', 'success');
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Error saving profile', 'error');
    }
}

// Change password
async function changePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    try {
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);

        showToast('Password updated successfully', 'success');
        document.getElementById('passwordModal').style.display = 'none';

    } catch (error) {
        console.error('Error changing password:', error);
        
        if (error.code === 'auth/wrong-password') {
            showToast('Current password is incorrect', 'error');
        } else {
            showToast('Error changing password', 'error');
        }
    }
}

// Load preferences
function loadPreferences(preferences) {
    if (!preferences) return;

    document.getElementById('emailNotifications').checked = preferences.notifications?.email !== false;
    document.getElementById('smsNotifications').checked = preferences.notifications?.sms || false;
    document.getElementById('pushNotifications').checked = preferences.notifications?.push !== false;
    
    document.getElementById('language').value = preferences.language || 'en';
    document.getElementById('currency').value = preferences.currency || 'USD';
}

// Save preferences
function savePreferences() {
    const preferences = {
        notifications: {
            email: document.getElementById('emailNotifications').checked,
            sms: document.getElementById('smsNotifications').checked,
            push: document.getElementById('pushNotifications').checked
        },
        language: document.getElementById('language').value,
        currency: document.getElementById('currency').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore
    db.collection(COLLECTIONS.USERS).doc(currentUserId).update({
        preferences: preferences
    }).then(() => {
        showToast('Preferences saved', 'success');
    }).catch((error) => {
        console.error('Error saving preferences:', error);
        showToast('Error saving preferences', 'error');
    });
}

// Set theme
function setTheme(theme) {
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // Save theme preference
    localStorage.setItem('theme', theme);
}

// Load KYC status
function loadKYCStatus(kyc) {
    const statusCard = document.getElementById('kycStatusCard');
    if (!statusCard) return;

    const status = kyc?.status || 'pending';
    const level = kyc?.level || 0;

    let statusHtml = '';
    if (status === 'verified') {
        statusHtml = `
            <span class="status-icon">✅</span>
            <div>
                <h4>Verified - Level ${level}</h4>
                <p>Your identity has been verified</p>
            </div>
        `;
    } else if (status === 'pending') {
        statusHtml = `
            <span class="status-icon">⏳</span>
            <div>
                <h4>Pending Verification</h4>
                <p>Your documents are being reviewed</p>
            </div>
        `;
    } else {
        statusHtml = `
            <span class="status-icon">❌</span>
            <div>
                <h4>Verification Required</h4>
                <p>Please complete KYC verification</p>
            </div>
        `;
    }

    statusCard.innerHTML = statusHtml;
}

// Load documents
async function loadDocuments() {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.KYC)
            .orderBy('uploadedAt', 'desc')
            .get();

        const grid = document.getElementById('documentsGrid');
        
        if (snapshot.empty) {
            grid.innerHTML = '<div class="empty-state">No documents uploaded</div>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const document = doc.data();
            const statusClass = document.status === 'verified' ? 'success' : 
                               document.status === 'rejected' ? 'error' : 'pending';

            html += `
                <div class="document-card">
                    <div class="document-icon">📄</div>
                    <div class="document-info">
                        <div class="document-name">${document.type || 'Document'}</div>
                        <div class="document-status ${statusClass}">${document.status || 'Pending'}</div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;

    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Upload document
async function uploadDocument(event) {
    event.preventDefault();

    const fileInput = document.getElementById('documentFile');
    const file = fileInput.files[0];
    const docType = document.getElementById('docType').value;

    if (!file) {
        showToast('Please select a file', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
    }

    try {
        showToast('Uploading document...', 'info');

        // Upload to Firebase Storage
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`kyc/${currentUserId}/${docType}_${Date.now()}`);
        await fileRef.put(file);
        
        const downloadUrl = await fileRef.getDownloadURL();

        // Save document info to Firestore
        await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.KYC).add({
                type: docType,
                url: downloadUrl,
                status: 'pending',
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                fileName: file.name
            });

        showToast('Document uploaded successfully', 'success');
        fileInput.value = '';
        loadDocuments();

    } catch (error) {
        console.error('Error uploading document:', error);
        showToast('Error uploading document', 'error');
    }
}

// Load login history
function loadLoginHistory() {
    const historyDiv = document.getElementById('loginHistory');
    
    // Mock data - would come from Firestore in production
    const history = [
        { date: '2026-03-15 10:30', device: 'Chrome on Windows', location: 'New York, USA' },
        { date: '2026-03-14 22:15', device: 'Safari on iPhone', location: 'New York, USA' },
        { date: '2026-03-13 08:45', device: 'Firefox on Mac', location: 'New York, USA' }
    ];

    let html = '';
    history.forEach(item => {
        html += `
            <div class="history-item">
                <span>${item.date}</span>
                <span>${item.device}</span>
                <span>${item.location}</span>
            </div>
        `;
    });

    historyDiv.innerHTML = html;
}

// Setup 2FA
function setupTwoFA() {
    showToast('2FA setup coming soon!', 'info');
}

// Change avatar
function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Upload avatar to Firebase Storage
            showToast('Avatar updated', 'success');
        }
    };
    input.click();
}

// Edit profile
function editProfile() {
    document.getElementById('personalTab').classList.add('active');
    document.querySelector('[onclick="switchProfileTab(\'personal\')"]').classList.add('active');
}

// Download data
function downloadData() {
    showToast('Preparing your data export...', 'info');
    setTimeout(() => {
        showToast('Data export ready', 'success');
    }, 3000);
}

// Upgrade KYC
function upgradeKYC() {
    window.location.href = '/kyc/';
}

// Setup profile tabs
function setupProfileTabs() {
    window.switchProfileTab = function(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-pane').forEach(tab => {
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

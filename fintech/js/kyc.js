// KYC Verification Page JavaScript
let currentUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
            loadKYCStatus();
            loadUserData();
        } else {
            window.location.href = '/login/';
        }
    });

    // Setup forms
    document.getElementById('personalInfoForm')?.addEventListener('submit', savePersonalInfo);
    document.getElementById('addressForm')?.addEventListener('submit', submitAddress);
});

// Load KYC status
async function loadKYCStatus() {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(currentUserId).get();
        const kyc = userDoc.data()?.kyc || { level: 0, status: 'pending' };

        const statusBanner = document.getElementById('kycStatusBanner');
        
        if (kyc.level >= 2) {
            statusBanner.innerHTML = `
                <div class="status-icon">✅</div>
                <div class="status-info">
                    <h3>Verified - Level ${kyc.level}</h3>
                    <p>Your identity has been verified. You have access to all features.</p>
                </div>
            `;
            statusBanner.className = 'kyc-status-banner verified';
        } else if (kyc.status === 'pending' && kyc.level === 1) {
            statusBanner.innerHTML = `
                <div class="status-icon">⏳</div>
                <div class="status-info">
                    <h3>Verification in Progress</h3>
                    <p>Your documents are being reviewed. This usually takes 1-2 business days.</p>
                </div>
            `;
            statusBanner.className = 'kyc-status-banner pending';
        } else {
            statusBanner.innerHTML = `
                <div class="status-icon">📝</div>
                <div class="status-info">
                    <h3>Complete Your Verification</h3>
                    <p>Please complete the steps below to verify your identity.</p>
                </div>
            `;
            statusBanner.className = 'kyc-status-banner';
        }

        // Update step status
        updateSteps(kyc);

    } catch (error) {
        console.error('Error loading KYC status:', error);
    }
}

// Load user data
async function loadUserData() {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(currentUserId).get();
        const data = userDoc.data();

        if (data) {
            document.getElementById('fullName').value = 
                `${data.profile?.firstName || ''} ${data.profile?.lastName || ''}`.trim();
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.profile?.phone || '';
            
            if (data.profile?.address) {
                document.getElementById('address').value = data.profile.address.street || '';
                document.getElementById('city').value = data.profile.address.city || '';
                document.getElementById('state').value = data.profile.address.state || '';
                document.getElementById('zip').value = data.profile.address.zip || '';
            }
        }

    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Save personal information
async function savePersonalInfo(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const dob = document.getElementById('dob').value;
    const nationality = document.getElementById('nationality').value;
    const phone = document.getElementById('phone').value;

    if (!fullName || !dob || !nationality) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        await db.collection(COLLECTIONS.USERS).doc(currentUserId).update({
            'profile.firstName': firstName,
            'profile.lastName': lastName,
            'profile.dob': dob,
            'profile.nationality': nationality,
            'profile.phone': phone,
            'kyc.level': 1,
            'kyc.status': 'pending',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast('Personal information saved', 'success');
        
        // Move to next step
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        document.querySelector('#step2 .step-content').style.display = 'block';

    } catch (error) {
        console.error('Error saving personal info:', error);
        showToast('Error saving information', 'error');
    }
}

// Submit address
async function submitAddress(event) {
    event.preventDefault();

    const address = {
        street: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        country: document.getElementById('country').value
    };

    if (!address.street || !address.city || !address.zip) {
        showToast('Please fill in all address fields', 'error');
        return;
    }

    try {
        await db.collection(COLLECTIONS.USERS).doc(currentUserId).update({
            'profile.address': address,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast('Address saved', 'success');
        
        // Move to next step
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.add('active');
        document.querySelector('#step3 .step-content').style.display = 'block';

    } catch (error) {
        console.error('Error saving address:', error);
        showToast('Error saving address', 'error');
    }
}

// Upload proof of address
function uploadProofOfAddress() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadDocument('proof_of_address', file);
        }
    };
    input.click();
}

// Upload ID front
function uploadIDFront() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadDocument('id_front', file);
        }
    };
    input.click();
}

// Upload ID back
function uploadIDBack() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadDocument('id_back', file);
        }
    };
    input.click();
}

// Upload selfie
function uploadSelfie() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadDocument('selfie', file);
        }
    };
    input.click();
}

// Upload document to Firebase
async function uploadDocument(type, file) {
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
    }

    try {
        showToast('Uploading document...', 'info');

        const storageRef = storage.ref();
        const fileRef = storageRef.child(`kyc/${currentUserId}/${type}_${Date.now()}`);
        await fileRef.put(file);
        
        const downloadUrl = await fileRef.getDownloadURL();

        await db.collection(COLLECTIONS.USERS).doc(currentUserId)
            .collection(COLLECTIONS.KYC).add({
                type: type,
                url: downloadUrl,
                status: 'pending',
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        showToast('Document uploaded successfully', 'success');

    } catch (error) {
        console.error('Error uploading document:', error);
        showToast('Error uploading document', 'error');
    }
}

// Update steps based on KYC level
function updateSteps(kyc) {
    if (kyc.level >= 1) {
        document.getElementById('step1').classList.add('completed');
        document.getElementById('step1').querySelector('.step-status').textContent = 'Completed';
    }
    if (kyc.level >= 2) {
        document.getElementById('step2').classList.add('completed');
        document.getElementById('step2').querySelector('.step-status').textContent = 'Completed';
    }
    if (kyc.level >= 3) {
        document.getElementById('step3').classList.add('completed');
        document.getElementById('step3').querySelector('.step-status').textContent = 'Completed';
    }
}

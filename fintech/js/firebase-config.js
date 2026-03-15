// Your Firebase configuration - REPLACE WITH YOUR ACTUAL VALUES
const firebaseConfig = {
    apiKey: "AIzaSyBp3VYC7KHz1KzX8h8n7X9c9d9e9f9g9h9i",
    authDomain: "taagc-fintech.firebaseapp.com",
    projectId: "taagc-fintech",
    storageBucket: "taagc-fintech.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789jkl",
    measurementId: "G-ABCDEF123"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open, persistence disabled');
        } else if (err.code == 'unimplemented') {
            console.log('Browser doesn\'t support persistence');
        }
    });

// Collection names
const COLLECTIONS = {
    USERS: 'users',
    CARDS: 'cards',
    TRANSACTIONS: 'transactions',
    ACCOUNTS: 'accounts',
    KYC: 'kyc',
    AUDIT: 'audit',
    NOTIFICATIONS: 'notifications'
};

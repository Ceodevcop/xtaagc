// Firebase Configuration for TAAGC Website
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { 
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAI1MrcP977UgRLQoePxl64JOSyj9v4WpI",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c",
    measurementId: "G-XXXXXXXXXX" // Add if you have Google Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Firestore Collections
const DB_COLLECTIONS = {
    USERS: 'users',
    CONTACTS: 'contacts',
    SUBSCRIBERS: 'subscribers',
    TESTIMONIALS: 'testimonials',
    PROJECTS: 'projects',
    BLOG_POSTS: 'blog_posts'
};

// Auth Error Messages
const AUTH_ERRORS = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/requires-recent-login': 'Please log in again to complete this action.'
};

// Export Firebase services and utilities
export { 
    app, 
    auth, 
    db, 
    storage,
    DB_COLLECTIONS,
    AUTH_ERRORS,
    
    // Auth Functions
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    
    // Firestore Functions
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc,
    
    // Storage Functions
    ref,
    uploadBytes,
    getDownloadURL
};

// Initialize Analytics if needed
/*
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
const analytics = getAnalytics(app);
export { analytics, logEvent };
*/

// Helper function to handle Firebase errors
export function getFirebaseErrorMessage(error) {
    const code = error.code || '';
    return AUTH_ERRORS[code] || error.message || 'An unexpected error occurred.';
}

// Helper function to validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Helper function to format timestamp
export function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize app on window load
window.addEventListener('load', () => {
    console.log('TAAGC Firebase initialized successfully');
});

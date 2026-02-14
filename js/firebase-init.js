// js/firebase-init.js - FIXED VERSION
const firebaseConfig = {
    apiKey: "AIzaSyAI1MrcP977UgRLQoePxl64JOSyj9v4WpI",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create global auth and db objects
const auth = firebase.auth();
const db = firebase.firestore();

// Make them available globally
window.auth = auth;
window.db = db;

console.log('✅ Firebase initialized successfully');

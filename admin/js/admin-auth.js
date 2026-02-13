// admin/js/admin-auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAI1MrcP977UgRLQoePxl64JOSyj9v4WpI",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('loginBtn');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const alertDiv = document.getElementById('alertMessage');
    
    btn.innerHTML = '<span class="loading"></span> Verifying...';
    btn.disabled = true;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        let isAdmin = false;
        let adminData = null;
        
        // Manual override for Ahmad Hamza
        if (email === 'priahmz@gmail.com') {
            isAdmin = true;
            adminData = {
                name: 'Ahmad Hamza',
                email: 'priahmz@gmail.com',
                role: 'super-admin',
                roleName: 'Super Administrator',
                uid: user.uid
            };
        } else {
            // Check Firestore
            try {
                const adminDoc = await getDoc(doc(db, "admins", user.uid));
                if (adminDoc.exists()) {
                    isAdmin = true;
                    adminData = adminDoc.data();
                }
            } catch (e) {}
        }
        
        if (isAdmin) {
            sessionStorage.setItem('taagc_admin', JSON.stringify(adminData));
            
            alertDiv.style.background = '#f0fff4';
            alertDiv.style.borderLeft = '4px solid #2e7d5e';
            alertDiv.style.color = '#22543d';
            alertDiv.innerHTML = `<i class="fas fa-check-circle"></i> Welcome, ${adminData.name || 'Administrator'}! Redirecting...`;
            alertDiv.style.display = 'flex';
            
            setTimeout(() => {
                window.location.href = '/admin/dashboard.html';
            }, 1500);
        } else {
            throw new Error('Access denied. Admin privileges required.');
        }
        
    } catch (error) {
        let errorMessage = 'Invalid email or password';
        if (error.code === 'auth/user-not-found') errorMessage = 'No account found with this email';
        if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
        
        alertDiv.style.background = '#fff5f5';
        alertDiv.style.borderLeft = '4px solid #e53e3e';
        alertDiv.style.color = '#742a2a';
        alertDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
        alertDiv.style.display = 'flex';
        
        btn.innerHTML = '<i class="fas fa-shield-alt"></i> Login to Admin Panel';
        btn.disabled = false;
    }
});

// Check if already logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const sessionAdmin = sessionStorage.getItem('taagc_admin');
        if (sessionAdmin) {
            window.location.href = '/admin/dashboard.html';
        }
    }
});

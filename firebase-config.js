// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    updateDoc,
    addDoc,
    deleteDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAI1MrcP977UgRLQoePxl64JOSyj9v4WpI",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:web:8da63bb7acc86c0ca98f0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== AUTH SERVICES =====
export const authService = {
    // Register Company
    async registerCompany(userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "companies", user.uid), {
                companyName: userData.companyName,
                registrationNumber: userData.registrationNumber,
                email: userData.email,
                phone: userData.phone,
                country: userData.country,
                sector: userData.sector,
                contactPerson: userData.contactPerson,
                jobTitle: userData.jobTitle,
                companySize: userData.companySize,
                registrationType: userData.registrationType,
                status: "pending",
                createdAt: serverTimestamp(),
                uid: user.uid,
                userType: "company"
            });
            
            await sendEmailVerification(user);
            return { success: true, user, message: "Verification email sent!" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Register Individual
    async registerIndividual(userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "individuals", user.uid), {
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                country: userData.country,
                accountType: userData.accountType, // shopper, investor, professional
                idType: userData.idType,
                idNumber: userData.idNumber,
                dob: userData.dob,
                status: "active",
                createdAt: serverTimestamp(),
                uid: user.uid,
                userType: "individual"
            });
            
            return { success: true, user, message: "Registration successful!" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Login
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Logout
    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Reset Password
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true, message: "Password reset email sent!" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get Current User
    getCurrentUser() {
        return auth.currentUser;
    }
};

// ===== SHOPPER SERVICES =====
export const shopperService = {
    // Create Order
    async createOrder(orderData, userId) {
        try {
            const orderRef = await addDoc(collection(db, "orders"), {
                ...orderData,
                userId,
                orderNumber: "TAAGC-" + Math.floor(Math.random() * 10000),
                status: "processing",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, orderId: orderRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get User Orders
    async getUserOrders(userId) {
        try {
            const q = query(
                collection(db, "orders"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const orders = [];
            querySnapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, orders };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Create Quote Request
    async createQuoteRequest(quoteData, userId) {
        try {
            const quoteRef = await addDoc(collection(db, "quotes"), {
                ...quoteData,
                userId,
                status: "pending",
                createdAt: serverTimestamp()
            });
            return { success: true, quoteId: quoteRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get User Quotes
    async getUserQuotes(userId) {
        try {
            const q = query(
                collection(db, "quotes"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const quotes = [];
            querySnapshot.forEach((doc) => {
                quotes.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, quotes };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Track Shipment
    async trackShipment(trackingNumber) {
        try {
            const q = query(
                collection(db, "shipments"),
                where("trackingNumber", "==", trackingNumber)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const shipment = querySnapshot.docs[0];
                return { success: true, shipment: { id: shipment.id, ...shipment.data() } };
            }
            return { success: false, error: "Shipment not found" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ===== INVESTOR SERVICES =====
export const investorService = {
    // Create Investment
    async createInvestment(investmentData, userId) {
        try {
            const investmentRef = await addDoc(collection(db, "investments"), {
                ...investmentData,
                userId,
                status: "active",
                createdAt: serverTimestamp()
            });
            return { success: true, investmentId: investmentRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get User Investments
    async getUserInvestments(userId) {
        try {
            const q = query(
                collection(db, "investments"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const investments = [];
            querySnapshot.forEach((doc) => {
                investments.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, investments };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get Investment Opportunities
    async getOpportunities() {
        try {
            const q = query(
                collection(db, "opportunities"),
                where("status", "==", "open"),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const opportunities = [];
            querySnapshot.forEach((doc) => {
                opportunities.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, opportunities };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ===== PROFESSIONAL SERVICES =====
export const professionalService = {
    // Create Project Bid
    async createBid(bidData, userId) {
        try {
            const bidRef = await addDoc(collection(db, "bids"), {
                ...bidData,
                userId,
                status: "pending",
                createdAt: serverTimestamp()
            });
            return { success: true, bidId: bidRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get User Projects
    async getUserProjects(userId) {
        try {
            const q = query(
                collection(db, "projects"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const projects = [];
            querySnapshot.forEach((doc) => {
                projects.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, projects };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get User Bids
    async getUserBids(userId) {
        try {
            const q = query(
                collection(db, "bids"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const bids = [];
            querySnapshot.forEach((doc) => {
                bids.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, bids };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ===== COMPANY SERVICES =====
export const companyService = {
    // Get Company Profile
    async getCompanyProfile(userId) {
        try {
            const docRef = doc(db, "companies", userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { success: true, company: { id: docSnap.id, ...docSnap.data() } };
            }
            return { success: false, error: "Company not found" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update Company Profile
    async updateCompanyProfile(userId, profileData) {
        try {
            const docRef = doc(db, "companies", userId);
            await updateDoc(docRef, {
                ...profileData,
                updatedAt: serverTimestamp()
            });
            return { success: true, message: "Profile updated!" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ===== SHARED SERVICES =====
export const sharedService = {
    // Get User Profile
    async getUserProfile(userId) {
        try {
            // Check individuals first
            const individualRef = doc(db, "individuals", userId);
            const individualSnap = await getDoc(individualRef);
            if (individualSnap.exists()) {
                return { success: true, user: { id: individualSnap.id, ...individualSnap.data() }, type: "individual" };
            }
            
            // Check companies
            const companyRef = doc(db, "companies", userId);
            const companySnap = await getDoc(companyRef);
            if (companySnap.exists()) {
                return { success: true, user: { id: companySnap.id, ...companySnap.data() }, type: "company" };
            }
            
            return { success: false, error: "User not found" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Create Support Ticket
    async createSupportTicket(ticketData, userId) {
        try {
            const ticketRef = await addDoc(collection(db, "support"), {
                ...ticketData,
                userId,
                status: "open",
                createdAt: serverTimestamp()
            });
            return { success: true, ticketId: ticketRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get User Support Tickets
    async getUserTickets(userId) {
        try {
            const q = query(
                collection(db, "support"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const tickets = [];
            querySnapshot.forEach((doc) => {
                tickets.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, tickets };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

export { auth, db };

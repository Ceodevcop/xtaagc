/**
 * TAAGC PLATFORM - MAIN API
 * Single entry point for all API endpoints
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();
const auth = admin.auth();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        req.userData = userDoc.exists ? userDoc.data() : null;
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.userData) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        if (roles.length && !roles.includes(req.userData.role) && req.userData.role !== 'super_admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.NODE_ENV
    });
});

// ============================================
// AUTH ENDPOINTS
// ============================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Note: Firebase Auth REST API would be called here
        // This is handled client-side normally
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, phone } = req.body;
        
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: fullName,
            emailVerified: false
        });
        
        // Create user profile in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            fullName,
            phone: phone || '',
            role: 'client',
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({
            success: true,
            uid: userRecord.uid,
            email: userRecord.email
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// USERS ENDPOINTS
// ============================================
app.get('/api/users', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();
        
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is accessing their own data or is admin
        if (req.user.uid !== id && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            success: true,
            user: { id: userDoc.id, ...userDoc.data() }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Check authorization
        if (req.user.uid !== id && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Remove sensitive fields
        delete updates.uid;
        delete updates.role;
        
        await db.collection('users').doc(id).update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/users/:id', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('users').doc(id).delete();
        await auth.deleteUser(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// INVESTORS ENDPOINTS
// ============================================
app.get('/api/investors', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const snapshot = await db.collection('investors').get();
        const investors = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json({ success: true, investors });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/investors/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const investorDoc = await db.collection('investors').doc(id).get();
        
        if (!investorDoc.exists) {
            return res.status(404).json({ error: 'Investor not found' });
        }
        
        res.json({
            success: true,
            investor: { id: investorDoc.id, ...investorDoc.data() }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/investors', authenticate, async (req, res) => {
    try {
        const { userId, investmentPreferences, riskTolerance } = req.body;
        
        const investorData = {
            userId: userId || req.user.uid,
            investmentPreferences: investmentPreferences || [],
            riskTolerance: riskTolerance || 'medium',
            totalInvested: 0,
            currentValue: 0,
            totalReturns: 0,
            investments: [],
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('investors').add(investorData);
        
        res.json({
            success: true,
            id: docRef.id,
            ...investorData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PROJECTS ENDPOINTS
// ============================================
app.get('/api/projects', async (req, res) => {
    try {
        const snapshot = await db.collection('projects')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .get();
        
        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const projectDoc = await db.collection('projects').doc(id).get();
        
        if (!projectDoc.exists) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({
            success: true,
            project: { id: projectDoc.id, ...projectDoc.data() }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/projects', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { title, description, targetAmount, minInvestment, roi, duration, riskLevel } = req.body;
        
        const projectData = {
            title,
            description,
            targetAmount: parseFloat(targetAmount),
            minInvestment: parseFloat(minInvestment),
            roi: parseFloat(roi),
            duration: parseInt(duration),
            riskLevel,
            raisedAmount: 0,
            investors: 0,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user.uid
        };
        
        const docRef = await db.collection('projects').add(projectData);
        
        res.json({
            success: true,
            id: docRef.id,
            ...projectData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/projects/:id', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        await db.collection('projects').doc(id).update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// INVESTMENTS ENDPOINTS
// ============================================
app.get('/api/investments', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const snapshot = await db.collection('investments')
            .orderBy('date', 'desc')
            .limit(100)
            .get();
        
        const investments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json({ success: true, investments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/investments/user/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check authorization
        if (req.user.uid !== userId && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const snapshot = await db.collection('investments')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .get();
        
        const investments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json({ success: true, investments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/investments', authenticate, async (req, res) => {
    try {
        const { projectId, amount } = req.body;
        
        // Get project details
        const projectDoc = await db.collection('projects').doc(projectId).get();
        if (!projectDoc.exists) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const project = projectDoc.data();
        
        // Create investment
        const investmentData = {
            userId: req.user.uid,
            projectId,
            amount: parseFloat(amount),
            status: 'pending',
            date: admin.firestore.FieldValue.serverTimestamp(),
            expectedReturn: parseFloat(amount) * (project.roi / 100),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('investments').add(investmentData);
        
        // Update project raised amount
        const newRaised = (project.raisedAmount || 0) + parseFloat(amount);
        const newInvestors = (project.investors || 0) + 1;
        
        await db.collection('projects').doc(projectId).update({
            raisedAmount: newRaised,
            investors: newInvestors
        });
        
        res.json({
            success: true,
            id: docRef.id,
            ...investmentData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// TRANSACTIONS ENDPOINTS
// ============================================
app.get('/api/transactions', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const snapshot = await db.collection('transactions')
            .orderBy('date', 'desc')
            .limit(100)
            .get();
        
        const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/transactions/user/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (req.user.uid !== userId && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const snapshot = await db.collection('transactions')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .get();
        
        const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/transactions', authenticate, async (req, res) => {
    try {
        const { type, amount, description, metadata } = req.body;
        
        const transactionData = {
            userId: req.user.uid,
            type,
            amount: parseFloat(amount),
            description,
            metadata: metadata || {},
            status: 'pending',
            date: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('transactions').add(transactionData);
        
        res.json({
            success: true,
            id: docRef.id,
            ...transactionData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// DASHBOARD STATS
// ============================================
app.get('/api/dashboard/stats', authenticate, async (req, res) => {
    try {
        const userId = req.user.uid;
        const role = req.userData?.role;
        
        let stats = {};
        
        if (role === 'super_admin' || role === 'admin') {
            // Admin stats
            const [users, projects, investments, transactions] = await Promise.all([
                db.collection('users').get(),
                db.collection('projects').get(),
                db.collection('investments').get(),
                db.collection('transactions').get()
            ]);
            
            stats = {
                totalUsers: users.size,
                totalProjects: projects.size,
                totalInvestments: investments.size,
                totalTransactions: transactions.size
            };
        } else {
            // User stats
            const [investments, transactions] = await Promise.all([
                db.collection('investments').where('userId', '==', userId).get(),
                db.collection('transactions').where('userId', '==', userId).get()
            ]);
            
            let totalInvested = 0;
            investments.forEach(doc => totalInvested += doc.data().amount || 0);
            
            stats = {
                investments: investments.size,
                transactions: transactions.size,
                totalInvested
            };
        }
        
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ADMIN STATS
// ============================================
app.get('/api/admin/stats', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const [
            users,
            investors,
            projects,
            investments,
            transactions
        ] = await Promise.all([
            db.collection('users').get(),
            db.collection('investors').get(),
            db.collection('projects').get(),
            db.collection('investments').get(),
            db.collection('transactions').get()
        ]);
        
        let totalInvested = 0;
        investments.forEach(doc => totalInvested += doc.data().amount || 0);
        
        let totalVolume = 0;
        transactions.forEach(doc => totalVolume += doc.data().amount || 0);
        
        res.json({
            success: true,
            stats: {
                users: users.size,
                investors: investors.size,
                projects: projects.size,
                investments: investments.size,
                transactions: transactions.size,
                totalInvested,
                totalVolume
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Export for Vercel
module.exports = app;

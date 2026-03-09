/**
 * TAAGC PLATFORM - SINGLE API FILE
 * All API endpoints in one file for Vercel deployment
 * Version: 2.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');

// ============================================
// INITIALIZATION
// ============================================
const app = express();

// Firebase Admin SDK
let firebaseApp;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });
    } else {
        // Use default credentials
        firebaseApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.FIREBASE_PROJECT_ID || 'xtaagc'
        });
    }
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.error('❌ Firebase init error:', error);
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Authentication middleware
 */
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
        req.userData = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
        
        // Update last active
        if (req.userData) {
            await db.collection('users').doc(decodedToken.uid).update({
                lastActive: admin.firestore.FieldValue.serverTimestamp()
            }).catch(() => {});
        }
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Authorization middleware
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.userData) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        if (roles.length > 0 && !roles.includes(req.userData.role) && req.userData.role !== 'super_admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
}

/**
 * Validate required fields
 */
function validateFields(requiredFields) {
    return (req, res, next) => {
        const missing = [];
        for (const field of requiredFields) {
            if (!req.body[field] && req.body[field] !== 0) {
                missing.push(field);
            }
        }
        
        if (missing.length > 0) {
            return res.status(400).json({ 
                error: `Missing required fields: ${missing.join(', ')}` 
            });
        }
        next();
    };
}

/**
 * Generate ID
 */
function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Format document
 */
function formatDoc(doc) {
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

/**
 * Format snapshot
 */
function formatSnapshot(snapshot) {
    return snapshot.docs.map(doc => formatDoc(doc));
}

/**
 * Log activity
 */
async function logActivity(collection, data) {
    try {
        await db.collection('activity_logs').add({
            ...data,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        firebase: firebaseApp ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

app.get('/api', (req, res) => {
    res.json({
        name: 'TAAGC API',
        version: '2.0.0',
        endpoints: {
            auth: '/api/auth/*',
            users: '/api/users/*',
            investors: '/api/investors/*',
            investments: '/api/investments/*',
            projects: '/api/projects/*',
            transactions: '/api/transactions/*',
            partners: '/api/partners/*',
            events: '/api/events/*',
            messages: '/api/messages/*',
            analytics: '/api/analytics/*',
            admin: '/api/admin/*',
            debug: '/api/debug'
        }
    });
});

app.get('/api/debug', (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        node: process.version,
        memory: process.memoryUsage(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
            CORS_ORIGIN: process.env.CORS_ORIGIN
        }
    });
});

// ============================================
// AUTH ENDPOINTS
// ============================================
const authRouter = express.Router();

// Login
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        // Note: Firebase Auth REST API would be called here
        // This endpoint is primarily for custom token generation
        
        res.json({ 
            success: true, 
            message: 'Login endpoint - use Firebase client SDK for actual authentication' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register
authRouter.post('/register', validateFields(['email', 'password', 'fullName']), async (req, res) => {
    try {
        const { email, password, fullName, phone } = req.body;
        
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: fullName,
            emailVerified: false,
            disabled: false
        });
        
        // Generate admin ID for appropriate roles
        let generatedId = null;
        if (req.body.role === 'admin' || req.body.role === 'super_admin') {
            const now = new Date();
            generatedId = `Ad${Math.floor(Math.random() * 900 + 100)}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        }
        
        // Create user profile in Firestore
        const userData = {
            uid: userRecord.uid,
            email,
            fullName,
            phone: phone || '',
            role: req.body.role || 'client',
            status: 'active',
            generatedId,
            emailVerified: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastActive: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
                registeredVia: 'api',
                userAgent: req.headers['user-agent'],
                ip: req.ip
            }
        };
        
        await db.collection('users').doc(userRecord.uid).set(userData);
        
        // Log activity
        await logActivity('auth_logs', {
            action: 'user_registered',
            userId: userRecord.uid,
            email,
            role: userData.role,
            ip: req.ip
        });
        
        res.status(201).json({
            success: true,
            uid: userRecord.uid,
            email: userRecord.email,
            message: 'Registration successful'
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        res.status(500).json({ error: error.message });
    }
});

// Verify email
authRouter.post('/verify-email', authenticate, async (req, res) => {
    try {
        await auth.updateUser(req.user.uid, {
            emailVerified: true
        });
        
        await db.collection('users').doc(req.user.uid).update({
            emailVerified: true,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset password
authRouter.post('/reset-password', validateFields(['email']), async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const user = await auth.getUserByEmail(email).catch(() => null);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Firebase handles password reset via email
        res.json({ 
            success: true, 
            message: 'Password reset email will be sent if account exists' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change password
authRouter.post('/change-password', authenticate, validateFields(['newPassword']), async (req, res) => {
    try {
        await auth.updateUser(req.user.uid, {
            password: req.body.newPassword
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user
authRouter.get('/me', authenticate, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User profile not found' });
        }
        
        res.json({
            success: true,
            user: formatDoc(userDoc)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update profile
authRouter.put('/profile', authenticate, async (req, res) => {
    try {
        const allowed = ['fullName', 'phone', 'address', 'avatar', 'notificationSettings'];
        const updates = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowed.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        
        await db.collection('users').doc(req.user.uid).update(updates);
        
        // Update Auth displayName if provided
        if (updates.fullName) {
            await auth.updateUser(req.user.uid, {
                displayName: updates.fullName
            });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/auth', authRouter);

// ============================================
// USERS ENDPOINTS
// ============================================
const usersRouter = express.Router();

// Get all users (admin only)
usersRouter.get('/', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { limit = 100, role, status, search } = req.query;
        
        let query = db.collection('users').orderBy('createdAt', 'desc');
        
        if (role) {
            query = query.where('role', '==', role);
        }
        
        if (status) {
            query = query.where('status', '==', status);
        }
        
        const snapshot = await query.limit(parseInt(limit)).get();
        let users = formatSnapshot(snapshot);
        
        // Filter by search term
        if (search) {
            const term = search.toLowerCase();
            users = users.filter(u => 
                u.email?.toLowerCase().includes(term) ||
                u.fullName?.toLowerCase().includes(term) ||
                u.generatedId?.toLowerCase().includes(term)
            );
        }
        
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
usersRouter.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check authorization
        if (req.user.uid !== id && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const userDoc = await db.collection('users').doc(id).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            success: true,
            user: formatDoc(userDoc)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create user (admin only)
usersRouter.post('/', authenticate, authorize('admin', 'super_admin'), validateFields(['email', 'fullName']), async (req, res) => {
    try {
        const { email, fullName, phone, role = 'client', status = 'active' } = req.body;
        
        // Check if user exists in Auth
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(email);
        } catch {
            // Create temporary password
            const tempPassword = Math.random().toString(36).slice(-10);
            userRecord = await auth.createUser({
                email,
                password: tempPassword,
                displayName: fullName,
                emailVerified: false
            });
        }
        
        // Generate ID for admin roles
        let generatedId = null;
        if (role === 'admin' || role === 'super_admin') {
            const now = new Date();
            generatedId = `Ad${Math.floor(Math.random() * 900 + 100)}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        }
        
        const userData = {
            uid: userRecord.uid,
            email,
            fullName,
            phone: phone || '',
            role,
            status,
            generatedId,
            emailVerified: userRecord.emailVerified,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user.uid
        };
        
        await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });
        
        res.status(201).json({
            success: true,
            uid: userRecord.uid,
            ...userData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user
usersRouter.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check authorization
        if (req.user.uid !== id && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const allowed = ['fullName', 'phone', 'address', 'avatar', 'notificationSettings'];
        
        // Admins can update more fields
        if (['admin', 'super_admin'].includes(req.userData?.role)) {
            allowed.push('role', 'status', 'generatedId');
        }
        
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowed.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        updates.updatedBy = req.user.uid;
        
        await db.collection('users').doc(id).update(updates);
        
        // Update Auth if name changed
        if (updates.fullName) {
            await auth.updateUser(id, { displayName: updates.fullName }).catch(() => {});
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user (super admin only)
usersRouter.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete from Firestore
        await db.collection('users').doc(id).delete();
        
        // Delete from Auth
        await auth.deleteUser(id).catch(() => {});
        
        // Delete user data from other collections
        const collections = ['investors', 'investments', 'transactions', 'messages'];
        for (const collection of collections) {
            const snapshot = await db.collection(collection).where('userId', '==', id).get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit().catch(() => {});
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user role (admin only)
usersRouter.patch('/:id/role', authenticate, authorize('admin', 'super_admin'), validateFields(['role']), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        const validRoles = ['client', 'investor', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        
        await db.collection('users').doc(id).update({
            role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user status (admin only)
usersRouter.patch('/:id/status', authenticate, authorize('admin', 'super_admin'), validateFields(['status']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatus = ['active', 'pending', 'suspended', 'inactive'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        await db.collection('users').doc(id).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Disable/enable Auth user
        if (status === 'suspended') {
            await auth.updateUser(id, { disabled: true }).catch(() => {});
        } else if (status === 'active') {
            await auth.updateUser(id, { disabled: false }).catch(() => {});
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/users', usersRouter);

// ============================================
// INVESTORS ENDPOINTS
// ============================================
const investorsRouter = express.Router();

// Get all investors (admin only)
investorsRouter.get('/', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const snapshot = await db.collection('investors').get();
        res.json({
            success: true,
            count: snapshot.size,
            investors: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get investor by ID
investorsRouter.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const investorDoc = await db.collection('investors').doc(id).get();
        
        if (!investorDoc.exists) {
            return res.status(404).json({ error: 'Investor not found' });
        }
        
        res.json({
            success: true,
            investor: formatDoc(investorDoc)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get investor by user ID
investorsRouter.get('/user/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check authorization
        if (req.user.uid !== userId && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const snapshot = await db.collection('investors').where('userId', '==', userId).limit(1).get();
        
        if (snapshot.empty) {
            return res.status(404).json({ error: 'Investor profile not found' });
        }
        
        res.json({
            success: true,
            investor: formatDoc(snapshot.docs[0])
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create investor profile
investorsRouter.post('/', authenticate, async (req, res) => {
    try {
        const { investmentPreferences, riskTolerance } = req.body;
        
        // Check if already exists
        const existing = await db.collection('investors').where('userId', '==', req.user.uid).get();
        if (!existing.empty) {
            return res.status(400).json({ error: 'Investor profile already exists' });
        }
        
        const investorData = {
            userId: req.user.uid,
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
        
        res.status(201).json({
            success: true,
            id: docRef.id,
            ...investorData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update investor profile
investorsRouter.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const investorDoc = await db.collection('investors').doc(id).get();
        
        if (!investorDoc.exists) {
            return res.status(404).json({ error: 'Investor not found' });
        }
        
        const data = investorDoc.data();
        
        // Check ownership
        if (data.userId !== req.user.uid && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const allowed = ['investmentPreferences', 'riskTolerance'];
        const updates = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowed.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        
        await db.collection('investors').doc(id).update(updates);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get investor portfolio
investorsRouter.get('/:id/portfolio', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const investorDoc = await db.collection('investors').doc(id).get();
        
        if (!investorDoc.exists) {
            return res.status(404).json({ error: 'Investor not found' });
        }
        
        const data = investorDoc.data();
        
        // Check authorization
        if (data.userId !== req.user.uid && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Get investments
        const investments = await db.collection('investments')
            .where('userId', '==', data.userId)
            .orderBy('date', 'desc')
            .get();
        
        const investmentList = formatSnapshot(investments);
        
        // Calculate totals
        const totalInvested = investmentList.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const totalReturns = investmentList.reduce((sum, inv) => sum + (inv.returns || 0), 0);
        const currentValue = investmentList.reduce((sum, inv) => sum + (inv.currentValue || inv.amount || 0), 0);
        
        res.json({
            success: true,
            portfolio: {
                totalInvested,
                currentValue,
                totalReturns,
                returnPercentage: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0,
                investments: investmentList
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/investors', investorsRouter);

// ============================================
// INVESTMENTS ENDPOINTS
// ============================================
const investmentsRouter = express.Router();

// Get all investments (admin only)
investmentsRouter.get('/', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { limit = 100, status } = req.query;
        
        let query = db.collection('investments').orderBy('date', 'desc');
        
        if (status) {
            query = query.where('status', '==', status);
        }
        
        const snapshot = await query.limit(parseInt(limit)).get();
        
        res.json({
            success: true,
            count: snapshot.size,
            investments: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get investment by ID
investmentsRouter.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const investmentDoc = await db.collection('investments').doc(id).get();
        
        if (!investmentDoc.exists) {
            return res.status(404).json({ error: 'Investment not found' });
        }
        
        const data = investmentDoc.data();
        
        // Check authorization
        if (data.userId !== req.user.uid && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        res.json({
            success: true,
            investment: formatDoc(investmentDoc)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create investment
investmentsRouter.post('/', authenticate, validateFields(['projectId', 'amount']), async (req, res) => {
    try {
        const { projectId, amount, metadata = {} } = req.body;
        
        // Get project details
        const projectDoc = await db.collection('projects').doc(projectId).get();
        if (!projectDoc.exists) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const project = projectDoc.data();
        
        // Check min investment
        if (amount < (project.minInvestment || 0)) {
            return res.status(400).json({ error: `Minimum investment is $${project.minInvestment}` });
        }
        
        // Create investment
        const investmentData = {
            userId: req.user.uid,
            projectId,
            amount: parseFloat(amount),
            status: 'pending',
            date: admin.firestore.FieldValue.serverTimestamp(),
            expectedReturn: parseFloat(amount) * (project.roi / 100),
            metadata,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('investments').add(investmentData);
        
        // Update project stats
        const newRaised = (project.raisedAmount || 0) + parseFloat(amount);
        const newInvestors = (project.investors || 0) + 1;
        
        await db.collection('projects').doc(projectId).update({
            raisedAmount: newRaised,
            investors: newInvestors
        });
        
        // Update investor profile
        const investorSnapshot = await db.collection('investors').where('userId', '==', req.user.uid).limit(1).get();
        if (!investorSnapshot.empty) {
            const investorDoc = investorSnapshot.docs[0];
            const investorData = investorDoc.data();
            
            await investorDoc.ref.update({
                totalInvested: (investorData.totalInvested || 0) + parseFloat(amount),
                investments: admin.firestore.FieldValue.arrayUnion(docRef.id),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
        res.status(201).json({
            success: true,
            id: docRef.id,
            ...investmentData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update investment status (admin only)
investmentsRouter.patch('/:id/status', authenticate, authorize('admin', 'super_admin'), validateFields(['status']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        const validStatus = ['pending', 'approved', 'completed', 'cancelled', 'failed'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const investmentDoc = await db.collection('investments').doc(id).get();
        if (!investmentDoc.exists) {
            return res.status(404).json({ error: 'Investment not found' });
        }
        
        const data = investmentDoc.data();
        
        await investmentDoc.ref.update({
            status,
            statusNotes: notes,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: req.user.uid
        });
        
        // If completed, update returns
        if (status === 'completed') {
            // Calculate actual returns (in production, this would come from project)
            const returns = data.amount * 0.15; // 15% return example
            
            await investmentDoc.ref.update({
                returns,
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Update investor total returns
            const investorSnapshot = await db.collection('investors').where('userId', '==', data.userId).limit(1).get();
            if (!investorSnapshot.empty) {
                const investorDoc = investorSnapshot.docs[0];
                await investorDoc.ref.update({
                    totalReturns: admin.firestore.FieldValue.increment(returns),
                    currentValue: admin.firestore.FieldValue.increment(returns),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get investments by user
investmentsRouter.get('/user/:userId', authenticate, async (req, res) => {
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
        
        res.json({
            success: true,
            count: snapshot.size,
            investments: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get investments by project
investmentsRouter.get('/project/:projectId', authenticate, async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const snapshot = await db.collection('investments')
            .where('projectId', '==', projectId)
            .orderBy('date', 'desc')
            .get();
        
        res.json({
            success: true,
            count: snapshot.size,
            investments: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/investments', investmentsRouter);

// ============================================
// PROJECTS ENDPOINTS
// ============================================
const projectsRouter = express.Router();

// Get all projects (public)
projectsRouter.get('/', async (req, res) => {
    try {
        const { status = 'active', category, limit = 50 } = req.query;
        
        let query = db.collection('projects').orderBy('createdAt', 'desc');
        
        if (status) {
            query = query.where('status', '==', status);
        }
        
        if (category) {
            query = query.where('category', '==', category);
        }
        
        const snapshot = await query.limit(parseInt(limit)).get();
        
        res.json({
            success: true,
            count: snapshot.size,
            projects: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get project by ID (public)
projectsRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const projectDoc = await db.collection('projects').doc(id).get();
        
        if (!projectDoc.exists) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({
            success: true,
            project: formatDoc(projectDoc)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create project (admin only)
projectsRouter.post('/', authenticate, authorize('admin', 'super_admin'), validateFields(['title', 'description', 'targetAmount', 'minInvestment', 'roi', 'duration']), async (req, res) => {
    try {
        const { title, description, category, targetAmount, minInvestment, roi, duration, riskLevel, image, details } = req.body;
        
        const projectData = {
            title,
            description,
            category: category || 'general',
            targetAmount: parseFloat(targetAmount),
            minInvestment: parseFloat(minInvestment),
            roi: parseFloat(roi),
            duration: parseInt(duration),
            riskLevel: riskLevel || 'medium',
            image: image || '',
            details: details || {},
            raisedAmount: 0,
            investors: 0,
            status: 'pending',
            featured: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user.uid
        };
        
        const docRef = await db.collection('projects').add(projectData);
        
        res.status(201).json({
            success: true,
            id: docRef.id,
            ...projectData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update project (admin only)
projectsRouter.put('/:id', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const allowed = ['title', 'description', 'category', 'targetAmount', 'minInvestment', 'roi', 'duration', 'riskLevel', 'image', 'details', 'status', 'featured'];
        const updates = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowed.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        updates.updatedBy = req.user.uid;
        
        await db.collection('projects').doc(id).update(updates);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete project (admin only)
projectsRouter.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if has investments
        const investments = await db.collection('investments').where('projectId', '==', id).limit(1).get();
        if (!investments.empty) {
            return res.status(400).json({ error: 'Cannot delete project with existing investments' });
        }
        
        await db.collection('projects').doc(id).delete();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get project investments (admin only)
projectsRouter.get('/:id/investments', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const snapshot = await db.collection('investments')
            .where('projectId', '==', id)
            .orderBy('date', 'desc')
            .get();
        
        res.json({
            success: true,
            count: snapshot.size,
            investments: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle featured status (admin only)
projectsRouter.patch('/:id/featured', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { featured } = req.body;
        
        await db.collection('projects').doc(id).update({
            featured: !!featured,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/projects', projectsRouter);

// ============================================
// TRANSACTIONS ENDPOINTS
// ============================================
const transactionsRouter = express.Router();

// Get all transactions (admin only)
transactionsRouter.get('/', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { limit = 100, type, status } = req.query;
        
        let query = db.collection('transactions').orderBy('date', 'desc');
        
        if (type) {
            query = query.where('type', '==', type);
        }
        
        if (status) {
            query = query.where('status', '==', status);
        }
        
        const snapshot = await query.limit(parseInt(limit)).get();
        
        res.json({
            success: true,
            count: snapshot.size,
            transactions: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transaction by ID
transactionsRouter.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const transactionDoc = await db.collection('transactions').doc(id).get();
        
        if (!transactionDoc.exists) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        const data = transactionDoc.data();
        
        // Check authorization
        if (data.userId !== req.user.uid && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        res.json({
            success: true,
            transaction: formatDoc(transactionDoc)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create transaction
transactionsRouter.post('/', authenticate, validateFields(['type', 'amount', 'description']), async (req, res) => {
    try {
        const { type, amount, description, metadata = {} } = req.body;
        
        const validTypes = ['deposit', 'withdrawal', 'investment', 'return', 'fee', 'refund'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }
        
        const transactionData = {
            userId: req.user.uid,
            type,
            amount: parseFloat(amount),
            description,
            metadata,
            status: 'pending',
            reference: generateId('txn'),
            date: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('transactions').add(transactionData);
        
        res.status(201).json({
            success: true,
            id: docRef.id,
            ...transactionData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update transaction status (admin only)
transactionsRouter.patch('/:id/status', authenticate, authorize('admin', 'super_admin'), validateFields(['status']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        const validStatus = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const transactionDoc = await db.collection('transactions').doc(id).get();
        if (!transactionDoc.exists) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        await transactionDoc.ref.update({
            status,
            statusNotes: notes,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: req.user.uid
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user transactions
transactionsRouter.get('/user/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check authorization
        if (req.user.uid !== userId && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const snapshot = await db.collection('transactions')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .limit(100)
            .get();
        
        res.json({
            success: true,
            count: snapshot.size,
            transactions: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transaction summary
transactionsRouter.get('/summary/overview', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const snapshot = await db.collection('transactions').get();
        
        let totalVolume = 0;
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let totalInvestments = 0;
        let totalReturns = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const amount = data.amount || 0;
            
            totalVolume += amount;
            
            switch(data.type) {
                case 'deposit':
                    totalDeposits += amount;
                    break;
                case 'withdrawal':
                    totalWithdrawals += amount;
                    break;
                case 'investment':
                    totalInvestments += amount;
                    break;
                case 'return':
                    totalReturns += amount;
                    break;
            }
        });
        
        res.json({
            success: true,
            summary: {
                totalVolume,
                totalDeposits,
                totalWithdrawals,
                totalInvestments,
                totalReturns,
                netFlow: totalDeposits - totalWithdrawals,
                transactionCount: snapshot.size
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/transactions', transactionsRouter);

// ============================================
// PARTNERS ENDPOINTS
// ============================================
const partnersRouter = express.Router();

// Get all partners (public)
partnersRouter.get('/', async (req, res) => {
    try {
        const { status = 'active' } = req.query;
        
        const snapshot = await db.collection('partners')
            .where('status', '==', status)
            .orderBy('name')
            .get();
        
        res.json({
            success: true,
            count: snapshot.size,
            partners: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get partner by ID (public)
partnersRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const partnerDoc = await db.collection('partners').doc(id).get();
        
        if (!partnerDoc.exists) {
            return res.status(404).json({ error: 'Partner not found' });
        }
        
        res.json({
            success: true,
            partner: formatDoc(partnerDoc)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create partner (admin only)
partnersRouter.post('/', authenticate, authorize('admin', 'super_admin'), validateFields(['name']), async (req, res) => {
    try {
        const { name, logo, description, website, commission = 0, category } = req.body;
        
        const partnerData = {
            name,
            logo: logo || '',
            description: description || '',
            website: website || '',
            commission: parseFloat(commission),
            category: category || 'general',
            status: 'active',
            projects: 0,
            investors: 0,
            totalInvestments: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user.uid
        };
        
        const docRef = await db.collection('partners').add(partnerData);
        
        res.status(201).json({
            success: true,
            id: docRef.id,
            ...partnerData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update partner (admin only)
partnersRouter.put('/:id', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const allowed = ['name', 'logo', 'description', 'website', 'commission', 'category', 'status'];
        const updates = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowed.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        updates.updatedBy = req.user.uid;
        
        await db.collection('partners').doc(id).update(updates);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete partner (admin only)
partnersRouter.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if has projects
        const projects = await db.collection('projects').where('partnerId', '==', id).limit(1).get();
        if (!projects.empty) {
            return res.status(400).json({ error: 'Cannot delete partner with existing projects' });
        }
        
        await db.collection('partners').doc(id).delete();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get partner projects
partnersRouter.get('/:id/projects', async (req, res) => {
    try {
        const { id } = req.params;
        
        const snapshot = await db.collection('projects')
            .where('partnerId', '==', id)
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .get();
        
        res.json({
            success: true,
            count: snapshot.size,
            projects: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/partners', partnersRouter);

// ============================================
// EVENTS ENDPOINTS
// ============================================
const eventsRouter = express.Router();

// Get all events (public)
eventsRouter.get('/', async (req, res) => {
    try {
        const { upcoming = true, limit = 50 } = req.query;
        
        let query = db.collection('events').orderBy('date', 'asc');
        
        if (upcoming === 'true') {
            query = query.where('date', '>=', new Date());
        }
        
        const snapshot = await query.limit(parseInt(limit)).get();
        
        res.json({
            success: true,
            count: snapshot.size,
            events: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get event by ID (public)
eventsRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const eventDoc = await db.collection('events').doc(id).get();
        
        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json({
            success: true,
            event: formatDoc(eventDoc)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create event (admin only)
eventsRouter.post('/', authenticate, authorize('admin', 'super_admin'), validateFields(['title', 'description', 'date']), async (req, res) => {
    try {
        const { title, description, date, location, type, capacity, image } = req.body;
        
        const eventData = {
            title,
            description,
            date: new Date(date),
            location: location || '',
            type: type || 'webinar',
            capacity: capacity || 0,
            image: image || '',
            attendees: 0,
            registrations: [],
            status: 'upcoming',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user.uid
        };
        
        const docRef = await db.collection('events').add(eventData);
        
        res.status(201).json({
            success: true,
            id: docRef.id,
            ...eventData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update event (admin only)
eventsRouter.put('/:id', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const allowed = ['title', 'description', 'date', 'location', 'type', 'capacity', 'image', 'status'];
        const updates = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowed.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        
        if (updates.date) {
            updates.date = new Date(updates.date);
        }
        
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        updates.updatedBy = req.user.uid;
        
        await db.collection('events').doc(id).update(updates);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register for event
eventsRouter.post('/:id/register', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const eventDoc = await db.collection('events').doc(id).get();
        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const event = eventDoc.data();
        
        // Check capacity
        if (event.capacity > 0 && event.attendees >= event.capacity) {
            return res.status(400).json({ error: 'Event is full' });
        }
        
        // Check if already registered
        if (event.registrations?.includes(req.user.uid)) {
            return res.status(400).json({ error: 'Already registered' });
        }
        
        await eventDoc.ref.update({
            attendees: admin.firestore.FieldValue.increment(1),
            registrations: admin.firestore.FieldValue.arrayUnion(req.user.uid)
        });
        
        // Create registration record
        await db.collection('event_registrations').add({
            eventId: id,
            userId: req.user.uid,
            registeredAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'confirmed'
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel registration
eventsRouter.delete('/:id/register', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const eventDoc = await db.collection('events').doc(id).get();
        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        await eventDoc.ref.update({
            attendees: admin.firestore.FieldValue.increment(-1),
            registrations: admin.firestore.FieldValue.arrayRemove(req.user.uid)
        });
        
        // Delete registration record
        const snapshot = await db.collection('event_registrations')
            .where('eventId', '==', id)
            .where('userId', '==', req.user.uid)
            .get();
        
        snapshot.docs.forEach(doc => doc.ref.delete());
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/events', eventsRouter);

// ============================================
// MESSAGES ENDPOINTS
// ============================================
const messagesRouter = express.Router();

// Get user messages
messagesRouter.get('/', authenticate, async (req, res) => {
    try {
        const { limit = 50, unreadOnly = false } = req.query;
        
        let query = db.collection('messages')
            .where('participants', 'array-contains', req.user.uid)
            .orderBy('timestamp', 'desc');
        
        if (unreadOnly === 'true') {
            query = query.where('read', '==', false)
                .where('recipientId', '==', req.user.uid);
        }
        
        const snapshot = await query.limit(parseInt(limit)).get();
        
        res.json({
            success: true,
            count: snapshot.size,
            messages: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get message by ID
messagesRouter.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const messageDoc = await db.collection('messages').doc(id).get();
        
        if (!messageDoc.exists) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        const data = messageDoc.data();
        
        // Check if user is participant
        if (!data.participants?.includes(req.user.uid) && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Mark as read if recipient
        if (data.recipientId === req.user.uid && !data.read) {
            await messageDoc.ref.update({
                read: true,
                readAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
        res.json({
            success: true,
            message: formatDoc(messageDoc)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message
messagesRouter.post('/', authenticate, validateFields(['recipientId', 'content']), async (req, res) => {
    try {
        const { recipientId, subject, content, type = 'direct' } = req.body;
        
        // Check if recipient exists
        const recipientDoc = await db.collection('users').doc(recipientId).get();
        if (!recipientDoc.exists) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        
        const messageData = {
            senderId: req.user.uid,
            recipientId,
            subject: subject || '',
            content,
            type,
            read: false,
            participants: [req.user.uid, recipientId],
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('messages').add(messageData);
        
        // Create notification for recipient
        await db.collection('notifications').add({
            userId: recipientId,
            type: 'message',
            title: 'New Message',
            content: `You have a new message from ${req.userData?.fullName || req.user.email}`,
            data: { messageId: docRef.id },
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.status(201).json({
            success: true,
            id: docRef.id,
            ...messageData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark as read
messagesRouter.patch('/:id/read', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const messageDoc = await db.collection('messages').doc(id).get();
        if (!messageDoc.exists) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        const data = messageDoc.data();
        
        // Check if user is recipient
        if (data.recipientId !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await messageDoc.ref.update({
            read: true,
            readAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete message
messagesRouter.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const messageDoc = await db.collection('messages').doc(id).get();
        if (!messageDoc.exists) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        const data = messageDoc.data();
        
        // Check if user is participant
        if (!data.participants?.includes(req.user.uid) && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await messageDoc.ref.delete();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get conversation between users
messagesRouter.get('/conversation/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;
        
        const snapshot = await db.collection('messages')
            .where('participants', 'array-contains', req.user.uid)
            .orderBy('timestamp', 'desc')
            .limit(parseInt(limit))
            .get();
        
        const messages = formatSnapshot(snapshot).filter(msg => 
            msg.participants.includes(userId)
        );
        
        res.json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unread count
messagesRouter.get('/unread/count', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('messages')
            .where('recipientId', '==', req.user.uid)
            .where('read', '==', false)
            .get();
        
        res.json({
            success: true,
            count: snapshot.size
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/messages', messagesRouter);

// ============================================
// ANALYTICS ENDPOINTS
// ============================================
const analyticsRouter = express.Router();

// Get dashboard analytics (admin only)
analyticsRouter.get('/dashboard', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const [users, investors, projects, investments, transactions] = await Promise.all([
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
            analytics: {
                users: {
                    total: users.size,
                    active: users.docs.filter(d => d.data().status === 'active').length
                },
                investors: {
                    total: investors.size
                },
                projects: {
                    total: projects.size,
                    active: projects.docs.filter(d => d.data().status === 'active').length
                },
                investments: {
                    total: investments.size,
                    value: totalInvested
                },
                transactions: {
                    total: transactions.size,
                    volume: totalVolume
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user growth
analyticsRouter.get('/users/growth', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const snapshot = await db.collection('users')
            .where('createdAt', '>=', startDate)
            .orderBy('createdAt', 'asc')
            .get();
        
        const growth = [];
        const daily = {};
        
        snapshot.forEach(doc => {
            const date = doc.data().createdAt.toDate().toISOString().split('T')[0];
            daily[date] = (daily[date] || 0) + 1;
        });
        
        let cumulative = 0;
        Object.keys(daily).sort().forEach(date => {
            cumulative += daily[date];
            growth.push({
                date,
                newUsers: daily[date],
                totalUsers: cumulative
            });
        });
        
        res.json({
            success: true,
            growth
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get investment trends
analyticsRouter.get('/investments/trends', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { months = 6 } = req.query;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        
        const snapshot = await db.collection('investments')
            .where('date', '>=', startDate)
            .orderBy('date', 'asc')
            .get();
        
        const monthly = {};
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.date.toDate();
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthly[month]) {
                monthly[month] = { count: 0, volume: 0 };
            }
            
            monthly[month].count++;
            monthly[month].volume += data.amount || 0;
        });
        
        const trends = Object.keys(monthly).sort().map(month => ({
            month,
            count: monthly[month].count,
            volume: monthly[month].volume
        }));
        
        res.json({
            success: true,
            trends
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get revenue stats
analyticsRouter.get('/revenue', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const investments = await db.collection('investments').get();
        const transactions = await db.collection('transactions').get();
        
        let totalInvested = 0;
        let totalReturns = 0;
        let platformFees = 0;
        
        investments.forEach(doc => {
            const data = doc.data();
            totalInvested += data.amount || 0;
            // Assume 2% platform fee
            platformFees += (data.amount || 0) * 0.02;
        });
        
        transactions.forEach(doc => {
            const data = doc.data();
            if (data.type === 'return') {
                totalReturns += data.amount || 0;
            }
        });
        
        res.json({
            success: true,
            revenue: {
                totalInvested,
                totalReturns,
                platformFees,
                netRevenue: platformFees,
                projectedAnnual: platformFees * 12
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/analytics', analyticsRouter);

// ============================================
// ADMIN ENDPOINTS
// ============================================
const adminRouter = express.Router();

// Get system stats
adminRouter.get('/stats', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const [
            users,
            investors,
            projects,
            investments,
            transactions,
            partners,
            events
        ] = await Promise.all([
            db.collection('users').get(),
            db.collection('investors').get(),
            db.collection('projects').get(),
            db.collection('investments').get(),
            db.collection('transactions').get(),
            db.collection('partners').get(),
            db.collection('events').get()
        ]);
        
        res.json({
            success: true,
            stats: {
                users: users.size,
                investors: investors.size,
                projects: projects.size,
                investments: investments.size,
                transactions: transactions.size,
                partners: partners.size,
                events: events.size
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get activity logs
adminRouter.get('/activity', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const snapshot = await db.collection('activity_logs')
            .orderBy('timestamp', 'desc')
            .limit(parseInt(limit))
            .get();
        
        res.json({
            success: true,
            count: snapshot.size,
            activities: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get system health
adminRouter.get('/health', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        // Test Firestore connection
        await db.collection('users').limit(1).get();
        
        res.json({
            success: true,
            health: {
                status: 'healthy',
                firebase: 'connected',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            health: {
                status: 'unhealthy',
                firebase: 'disconnected',
                error: error.message
            }
        });
    }
});

// Get audit logs
adminRouter.get('/audit-logs', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { limit = 100, userId, action } = req.query;
        
        let query = db.collection('audit_logs').orderBy('timestamp', 'desc');
        
        if (userId) {
            query = query.where('userId', '==', userId);
        }
        
        if (action) {
            query = query.where('action', '==', action);
        }
        
        const snapshot = await query.limit(parseInt(limit)).get();
        
        res.json({
            success: true,
            count: snapshot.size,
            logs: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export collection
adminRouter.get('/export/:collection', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { collection } = req.params;
        const { format = 'json' } = req.query;
        
        const snapshot = await db.collection(collection).get();
        const data = formatSnapshot(snapshot);
        
        if (format === 'csv') {
            // Convert to CSV
            const headers = Object.keys(data[0] || {}).join(',');
            const rows = data.map(item => Object.values(item).join(',')).join('\n');
            const csv = `${headers}\n${rows}`;
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${collection}_export.csv`);
            return res.send(csv);
        }
        
        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear cache
adminRouter.post('/cache/clear', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        // Implement cache clearing logic
        res.json({ success: true, message: 'Cache cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/admin', adminRouter);

// ============================================
// NOTIFICATIONS ENDPOINTS
// ============================================
const notificationsRouter = express.Router();

// Get user notifications
notificationsRouter.get('/', authenticate, async (req, res) => {
    try {
        const { limit = 50, unreadOnly = false } = req.query;
        
        let query = db.collection('notifications')
            .where('userId', '==', req.user.uid)
            .orderBy('timestamp', 'desc');
        
        if (unreadOnly === 'true') {
            query = query.where('read', '==', false);
        }
        
        const snapshot = await query.limit(parseInt(limit)).get();
        
        res.json({
            success: true,
            count: snapshot.size,
            notifications: formatSnapshot(snapshot)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
notificationsRouter.patch('/:id/read', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const notifDoc = await db.collection('notifications').doc(id).get();
        if (!notifDoc.exists) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        const data = notifDoc.data();
        
        if (data.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await notifDoc.ref.update({
            read: true,
            readAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark all as read
notificationsRouter.post('/read-all', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', req.user.uid)
            .where('read', '==', false)
            .get();
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                read: true,
                readAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        await batch.commit();
        
        res.json({ success: true, count: snapshot.size });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete notification
notificationsRouter.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const notifDoc = await db.collection('notifications').doc(id).get();
        if (!notifDoc.exists) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        const data = notifDoc.data();
        
        if (data.userId !== req.user.uid && !['admin', 'super_admin'].includes(req.userData?.role)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await notifDoc.ref.delete();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unread count
notificationsRouter.get('/unread/count', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', req.user.uid)
            .where('read', '==', false)
            .get();
        
        res.json({
            success: true,
            count: snapshot.size
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/notifications', notificationsRouter);

// ============================================
// SETTINGS ENDPOINTS
// ============================================
const settingsRouter = express.Router();

// Get public settings
settingsRouter.get('/public', async (req, res) => {
    try {
        const snapshot = await db.collection('settings').get();
        const settings = {};
        
        snapshot.forEach(doc => {
            if (doc.data().isPublic) {
                settings[doc.id] = doc.data().value;
            }
        });
        
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all settings (admin only)
settingsRouter.get('/', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const snapshot = await db.collection('settings').get();
        const settings = {};
        
        snapshot.forEach(doc => {
            settings[doc.id] = doc.data();
        });
        
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get setting by key
settingsRouter.get('/:key', authenticate, async (req, res) => {
    try {
        const { key } = req.params;
        const settingDoc = await db.collection('settings').doc(key).get();
        
        if (!settingDoc.exists) {
            return res.status(404).json({ error: 'Setting not found' });
        }
        
        res.json({
            success: true,
            key: settingDoc.id,
            ...settingDoc.data()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update setting (admin only)
settingsRouter.put('/:key', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
    try {
        const { key } = req.params;
        const { value, type, isPublic, description } = req.body;
        
        const settingData = {
            value,
            type: type || typeof value,
            isPublic: isPublic || false,
            description: description || '',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: req.user.uid
        };
        
        await db.collection('settings').doc(key).set(settingData, { merge: true });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete setting (admin only)
settingsRouter.delete('/:key', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const { key } = req.params;
        await db.collection('settings').doc(key).delete();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/settings', settingsRouter);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ============================================
// EXPORT FOR VERCEL
// ============================================
module.exports = app;

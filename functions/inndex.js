// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Function to set admin claims
exports.setAdminRole = functions.https.onCall(async (data, context) => {
    // Only allow developers to call this function
    const developerEmails = ['priahmz@gmail.com']; // Add your emails
    
    if (!context.auth || !developerEmails.includes(context.auth.token.email)) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only developers can set admin roles'
        );
    }

    const { uid, email } = data;
    
    // Set custom admin claims
    await admin.auth().setCustomUserClaims(uid, {
        admin: true,
        role: 'super-admin'
    });

    // Add to Firestore users collection
    await admin.firestore().collection('users').doc(uid).set({
        email: email,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { 
        success: true, 
        message: `Admin role set for ${email}` 
    };
});

// Function to create initial admin
exports.createInitialAdmin = functions.https.onRequest(async (req, res) => {
    // SECURITY: Only allow from your IP or with secret key
    const secretKey = req.query.key;
    if (secretKey !== 'YOUR_SECRET_KEY_HERE') {
        return res.status(403).send('Unauthorized');
    }

    const { email, password } = req.body;

    try {
        // Create user
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            emailVerified: true
        });

        // Set admin claims
        await admin.auth().setCustomUserClaims(userRecord.uid, {
            admin: true,
            role: 'super-admin'
        });

        // Add to Firestore
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            email: email,
            role: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system'
        });

        return res.json({
            success: true,
            uid: userRecord.uid,
            email: userRecord.email,
            message: 'Admin user created successfully'
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Function to check if user is admin
exports.checkAdminStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User not authenticated'
        );
    }

    const user = await admin.auth().getUser(context.auth.uid);
    const isAdmin = user.customClaims?.admin === true;

    return {
        isAdmin: isAdmin,
        uid: context.auth.uid,
        email: context.auth.token.email,
        claims: user.customClaims || {}
    };
});

// Auto-create user document on signup
exports.createUserDocument = functions.auth.user().onCreate(async (user) => {
    const userData = {
        email: user.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: null,
        role: 'user'
    };

    // Check if this is the first user (make them admin)
    const usersCount = await admin.firestore().collection('users').count().get();
    
    if (usersCount.data().count === 0) {
        // First user is admin
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        userData.role = 'admin';
    }

    await admin.firestore().collection('users').doc(user.uid).set(userData);
    
    return null;
});

// firebase-admin-setup.js - Run this in Firebase Cloud Functions or Console
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json'); // Download from Firebase Console

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupAdminAhmadHamza() {
    const adminEmail = "priahmz@gmail.com";
    const adminName = "Ahmad Hamza";
    const adminPassword = "Admin/Taagc/001"; // Only used if creating new user
    
    try {
        // 1. Find or create user
        let user;
        try {
            user = await admin.auth().getUserByEmail(adminEmail);
            console.log(`✅ User found: ${user.uid}`);
        } catch (error) {
            // User doesn't exist, create one
            user = await admin.auth().createUser({
                email: adminEmail,
                password: adminPassword,
                displayName: adminName,
                emailVerified: true
            });
            console.log(`✅ User created: ${user.uid}`);
        }

        // 2. Set custom admin claims
        await admin.auth().setCustomUserClaims(user.uid, {
            admin: true,
            role: 'super-admin',
            name: adminName,
            email: adminEmail,
            permissions: [
                'create_pages',
                'edit_pages', 
                'delete_pages',
                'manage_users',
                'view_analytics'
            ]
        });
        console.log(`✅ Admin claims set for ${adminEmail}`);

        // 3. Create admin document in Firestore
        await db.collection('admins').doc(user.uid).set({
            uid: user.uid,
            name: adminName,
            email: adminEmail,
            role: 'super-admin',
            permissions: [
                'create_pages',
                'edit_pages',
                'delete_pages',
                'manage_users',
                'view_analytics'
            ],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: 'system',
            status: 'active',
            lastLogin: null
        });

        // 4. Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            name: adminName,
            email: adminEmail,
            role: 'admin',
            userType: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            emailVerified: true
        }, { merge: true });

        console.log(`✅ Admin document created in Firestore`);
        console.log(`\n🎉 ADMIN SETUP COMPLETE!`);
        console.log(`================================`);
        console.log(`Name:     Ahmad Hamza`);
        console.log(`Email:    priahmz@gmail.com`);
        console.log(`Password: Admin/Taagc/001`);
        console.log(`Role:     Super Administrator`);
        console.log(`================================`);

        return { success: true, uid: user.uid };

    } catch (error) {
        console.error(`❌ Setup failed:`, error);
        return { success: false, error: error.message };
    }
}

// Run the setup
setupAdminAhmadHamza();

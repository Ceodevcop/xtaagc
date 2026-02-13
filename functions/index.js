// functions/index.js
exports.setAdminRole = functions.https.onCall(async (data, context) => {
    const admin = require('firebase-admin');
    
    // Only allow existing admins to create new admins
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only administrators can set admin roles'
        );
    }
    
    await admin.auth().setCustomUserClaims(data.uid, {
        admin: true,
        role: 'super-admin',
        name: data.name || 'Admin',
        email: data.email
    });
    
    return { success: true };
});

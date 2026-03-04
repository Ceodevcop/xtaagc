const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to set role'
    );
  }

  const { uid, role } = data;

  // Only allow setting role for yourself or if you're an admin
  if (context.auth.uid !== uid && !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You can only set your own role'
    );
  }

  // Validate role
  if (!['client', 'investor', 'admin'].includes(role)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Role must be client, investor, or admin'
    );
  }

  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      [role]: true,
      role: role
    });

    // Update user document
    await admin.firestore().collection('users').doc(uid).update({
      role: role,
      roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: `Role set to ${role}` };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// config/firebase.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Collections
const collections = {
  users: db.collection('users'),
  admins: db.collection('admins'),
  staff: db.collection('staff'),
  investors: db.collection('investors'),
  projects: db.collection('projects'),
  investments: db.collection('investments'),
  transactions: db.collection('transactions'),
  partners: db.collection('partners'),
  events: db.collection('events'),
  messages: db.collection('messages'),
  notifications: db.collection('notifications'),
  analytics: db.collection('analytics'),
  settings: db.collection('settings'),
  auditLogs: db.collection('audit_logs')
};

module.exports = {
  admin,
  db,
  auth,
  storage,
  collections
};

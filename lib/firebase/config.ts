// Your Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  ACCOUNTS: 'accounts',
  CARDS: 'cards',
  TRANSACTIONS: 'transactions',
  KYC: 'kyc',
  AUDIT: 'audit',
  COMPLIANCE: 'compliance',
  NOTIFICATIONS: 'notifications',
  EXCHANGE_RATES: 'exchangeRates',
  MERCHANTS: 'merchants',
} as const;

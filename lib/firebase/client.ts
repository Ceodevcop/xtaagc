import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, Firestore, connectFirestoreEmulator, 
  collection, doc, setDoc, getDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, getDocs, addDoc,
  onSnapshot, Timestamp, serverTimestamp, writeBatch,
  runTransaction, arrayUnion, arrayRemove, increment
} from 'firebase/firestore';
import { 
  getStorage, FirebaseStorage, connectStorageEmulator,
  ref, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';
import { 
  getFunctions, Functions, connectFunctionsEmulator,
  httpsCallable 
} from 'firebase/functions';
import { firebaseConfig } from './config';

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'asia-southeast1');

  // Enable offline persistence
  // enableIndexedDbPersistence(db).catch((err) => {
  //   console.error('Firestore persistence error:', err);
  // });

  // Use emulators in development
  if (process.env.NODE_ENV === 'development') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'asia-southeast1');
}

// Export initialized services
export { 
  app, auth, db, storage, functions,
  // Firestore helpers
  collection, doc, setDoc, getDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, getDocs, addDoc,
  onSnapshot, Timestamp, serverTimestamp, writeBatch,
  runTransaction, arrayUnion, arrayRemove, increment
};

// Export callable functions
export const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
export const issueCard = httpsCallable(functions, 'issueCard');
export const processTransfer = httpsCallable(functions, 'processTransfer');
export const verifyKYC = httpsCallable(functions, 'verifyKYC');
export const freezeCard = httpsCallable(functions, 'freezeCard');
export const generateStatement = httpsCallable(functions, 'generateStatement');

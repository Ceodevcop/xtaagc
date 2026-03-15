import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signOut 
} from "firebase/auth";
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
  limit,
  Timestamp 
} from "firebase/firestore";
import { 
  getFunctions, 
  httpsCallable 
} from "firebase/functions";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAysDaLRza0-SLnp778K9eZ8XBAa7hRu58",
  authDomain: "fintech-ad170.firebaseapp.com",
  projectId: "fintech-ad170",
  storageBucket: "fintech-ad170.firebasestorage.app",
  messagingSenderId: "110922302396",
  appId: "1:110922302396:web:558751ccf7c45a70b761b9",
  measurementId: "G-6GGYPJME1V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Helper functions
const setupRecaptcha = (containerId) => {
  auth.useDeviceLanguage();
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible'
  });
  return window.recaptchaVerifier;
};

const getCurrentUser = () => {
  return auth.currentUser;
};

const getUserRole = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data().role : 'customer';
};

export { 
  app, 
  auth, 
  db, 
  functions, 
  storage, 
  analytics,
  signInWithPhoneNumber,
  signOut,
  setupRecaptcha,
  getCurrentUser,
  getUserRole,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  httpsCallable,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
};

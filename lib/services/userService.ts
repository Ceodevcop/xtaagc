import { 
  db, auth, collection, doc, setDoc, getDoc, updateDoc,
  query, where, getDocs, serverTimestamp, onSnapshot
} from '@/lib/firebase/client';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { COLLECTIONS } from '@/lib/firebase/config';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  profile?: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  kyc: {
    level: 0 | 1 | 2 | 3;
    status: 'pending' | 'verified' | 'rejected';
    verifiedAt?: Date;
    documents: Array<{
      type: 'passport' | 'driver_license' | 'national_id';
      url: string;
      status: 'pending' | 'verified' | 'rejected';
      uploadedAt: Date;
    }>;
  };
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    twoFactorEnabled: boolean;
  };
  metadata: {
    createdAt: Date;
    lastLogin?: Date;
    lastActivity?: Date;
  };
}

export class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Register new user
  async register(email: string, password: string, profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    await setDoc(userRef, {
      email: user.email,
      displayName: `${profile.firstName} ${profile.lastName}`,
      phoneNumber: profile.phoneNumber,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
      kyc: {
        level: 0,
        status: 'pending',
        documents: [],
      },
      preferences: {
        language: 'en',
        currency: 'USD',
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        twoFactorEnabled: false,
      },
      metadata: {
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      },
    });

    // Create initial account
    const accountRef = doc(collection(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.ACCOUNTS));
    await setDoc(accountRef, {
      type: 'checking',
      currency: 'USD',
      balance: 0,
      status: 'active',
      createdAt: serverTimestamp(),
    });

    return user;
  }

  // Login
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login
    const userRef = doc(db, COLLECTIONS.USERS, userCredential.user.uid);
    await updateDoc(userRef, {
      'metadata.lastLogin': serverTimestamp(),
    });

    return userCredential.user;
  }

  // Logout
  async logout() {
    await signOut(auth);
  }

  // Get user data with real-time updates
  subscribeToUser(userId: string, callback: (user: User | null) => void) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          uid: doc.id,
          ...data,
          metadata: {
            ...data.metadata,
            createdAt: data.metadata?.createdAt?.toDate(),
            lastLogin: data.metadata?.lastLogin?.toDate(),
            lastActivity: data.metadata?.lastActivity?.toDate(),
          },
          kyc: {
            ...data.kyc,
            verifiedAt: data.kyc?.verifiedAt?.toDate(),
            documents: data.kyc?.documents?.map((d: any) => ({
              ...d,
              uploadedAt: d.uploadedAt?.toDate(),
            })) || [],
          },
        } as User);
      } else {
        callback(null);
      }
    });
  }

  // Update user profile
  async updateProfile(userId: string, profile: Partial<User['profile']>) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      'profile': profile,
      'metadata.updatedAt': serverTimestamp(),
    });
  }

  // Submit KYC documents
  async submitKYC(userId: string, documents: Array<{
    type: 'passport' | 'driver_license' | 'national_id';
    url: string;
  }>) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    await updateDoc(userRef, {
      'kyc.documents': documents.map(doc => ({
        ...doc,
        status: 'pending',
        uploadedAt: serverTimestamp(),
      })),
      'kyc.status': 'pending',
      'metadata.updatedAt': serverTimestamp(),
    });

    // Create compliance record
    const complianceRef = doc(collection(db, COLLECTIONS.COMPLIANCE));
    await setDoc(complianceRef, {
      userId,
      type: 'KYC_SUBMISSION',
      documents,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }

  // Update preferences
  async updatePreferences(userId: string, preferences: Partial<User['preferences']>) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      'preferences': preferences,
      'metadata.updatedAt': serverTimestamp(),
    });
  }

  // Enable/Disable 2FA
  async toggle2FA(userId: string, enabled: boolean) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      'preferences.twoFactorEnabled': enabled,
      'metadata.updatedAt': serverTimestamp(),
    });
  }
}

export const userService = UserService.getInstance();

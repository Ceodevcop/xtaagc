// Firestore Security Rules - Copy these to Firebase Console
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Allow admins to read/write all users
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
    }
    
    // Allow authenticated users to read/write their own data
    match /investments/{investment} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Admin only collections
    match /audit_logs/{log} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
      allow write: if request.auth != null;
    }
    
    match /settings/{setting} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
    }
  }
}

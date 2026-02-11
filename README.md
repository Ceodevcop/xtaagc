# TAAGC Admin Panel

A complete Firebase-based admin panel for managing TAAGC website pages with drag-and-drop editor.

## Setup Instructions

1. **Upload all files** to your web hosting (Firebase Hosting recommended)

2. **Set up Firebase Authentication:**
   - Go to Firebase Console > Authentication
   - Enable Email/Password provider
   - Add admin users manually or use the admin setup script

3. **Set up Firestore Database:**
   - Go to Firestore Database
   - Create collections: `pages`, `users`
   - Set up security rules (provided in security-rules.txt)

4. **Create initial admin user:**
   - Run the setup script or add manually via Firebase Console
   - Email: priahmz@gmail.com (or your admin email)
   - Set custom claims: `{ admin: true }`

## File Structure

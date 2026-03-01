<?php
// set-admin.php - Server-side admin fix
header('Content-Type: application/json');

require 'vendor/autoload.php'; // If using Composer

use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;

try {
    // Initialize Firebase Admin SDK
    $factory = (new Factory)
        ->withServiceAccount('path/to/firebase-credentials.json')
        ->withDatabaseUri('https://xtaagc.firebaseio.com');
    
    $auth = $factory->createAuth();
    $firestore = $factory->createFirestore();

    $email = $_POST['email'] ?? '';

    if (!$email) {
        echo json_encode(['error' => 'Email required']);
        exit;
    }

    // Get user by email
    $user = $auth->getUserByEmail($email);
    
    // Generate Admin ID
    $adminId = 'Ad' . rand(100, 999) . '/' . date('m/Y');
    
    // Create/Update Firestore document
    $firestore->database()->collection('users')->document($user->uid)->set([
        'uid' => $user->uid,
        'email' => $user->email,
        'fullName' => $user->displayName ?? 'Admin User',
        'role' => 'super_admin',
        'status' => 'active',
        'generatedId' => $adminId,
        'createdAt' => new \Kreait\Firebase\Timestamp(new DateTime()),
        'permissions' => ['all']
    ], ['merge' => true]);

    echo json_encode([
        'success' => true,
        'message' => 'User updated to super_admin',
        'uid' => $user->uid,
        'email' => $user->email,
        'adminId' => $adminId
    ]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>

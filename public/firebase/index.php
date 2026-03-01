<?php
// firebase-proxy.php - Place in your website root
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the Firebase API key from request
$apiKey = $_GET['key'] ?? 'AIzaSyAI1MrcP977UgRLQoePxl64JOSyj9v4WpI';
$endpoint = $_GET['endpoint'] ?? 'signUp';

// Firebase endpoints
$endpoints = [
    'signUp' => 'https://identitytoolkit.googleapis.com/v1/accounts:signUp',
    'signIn' => 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
    'lookup' => 'https://identitytoolkit.googleapis.com/v1/accounts:lookup'
];

$url = $endpoints[$endpoint] . '?key=' . $apiKey;

// Get request body
$body = file_get_contents('php://input');

// Initialize cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($body)
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => $error]);
} else {
    http_response_code($httpCode);
    echo $response;
}
?>

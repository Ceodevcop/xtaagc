<?php
// getStaffImage.php - Ultra-simple version with maximum compatibility

// Turn off error reporting for clean image output
error_reporting(0);
ini_set('display_errors', 0);

// Get parameters
$rank = isset($_GET['rank']) ? intval($_GET['rank']) : 0;
$initials = isset($_GET['initials']) ? preg_replace('/[^A-Z]/', '', strtoupper($_GET['initials'])) : '?';
$preview = isset($_GET['preview']);

// If preview mode, return JSON
if ($preview) {
    header('Content-Type: application/json');
    echo json_encode([
        'rank' => $rank,
        'initials' => $initials,
        'message' => 'Preview mode'
    ]);
    exit;
}

// Define colors
$colors = [
    1 => '#0a2540', 2 => '#1a3a4f', 3 => '#2d5a4a', 4 => '#3a5a78',
    5 => '#4a6b8a', 6 => '#5a7b9a', 7 => '#6a8baa', 8 => '#7a9bba',
    9 => '#8aabca', 10 => '#9abbda', 11 => '#aacbea', 12 => '#bacdf0',
    13 => '#c19a6b', 14 => '#b38b5f', 15 => '#a57b53', 16 => '#976c47',
    17 => '#895c3b', 18 => '#7b4d2f', 19 => '#6d3d23', 20 => '#5f2e17',
    21 => '#511e0b', 22 => '#c19a6b'
];

$bgColor = isset($colors[$rank]) ? $colors[$rank] : '#0a2540';
$textColor = '#c19a6b';

// Try to find uploaded image
$uploadDir = 'uploads/';
$imageFile = null;

if (is_dir($uploadDir)) {
    $pattern = $uploadDir . "*rank_{$rank}_*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}";
    $files = glob($pattern, GLOB_BRACE);
    if (!empty($files)) {
        $imageFile = $files[0];
    }
}

// If we have an uploaded image, serve it
if ($imageFile && file_exists($imageFile)) {
    $ext = strtolower(pathinfo($imageFile, PATHINFO_EXTENSION));
    $contentType = 'image/jpeg';
    
    if ($ext == 'png') $contentType = 'image/png';
    if ($ext == 'gif') $contentType = 'image/gif';
    if ($ext == 'webp') $contentType = 'image/webp';
    
    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . filesize($imageFile));
    header('Cache-Control: public, max-age=86400');
    readfile($imageFile);
    exit;
}

// Otherwise generate SVG
header('Content-Type: image/svg+xml');

// Simple SVG template
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="<?php echo $bgColor; ?>"/>
    <text x="200" y="200" font-family="Arial, Helvetica, sans-serif" font-size="120" fill="<?php echo $textColor; ?>" text-anchor="middle" dominant-baseline="middle"><?php echo htmlspecialchars($initials); ?></text>
    <text x="200" y="350" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="<?php echo $textColor; ?>" text-anchor="middle" opacity="0.5">Rank <?php echo str_pad($rank, 2, '0', STR_PAD_LEFT); ?></text>
</svg>
<?php
exit;
?>

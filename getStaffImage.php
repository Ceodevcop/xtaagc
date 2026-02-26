<?php
// getStaffImage.php - Handles staff image retrieval with rank-specific images

// Enable error reporting for debugging (disable in production)
error_reporting(0);
ini_set('display_errors', 0);

// Get parameters
$rank = isset($_GET['rank']) ? intval($_GET['rank']) : 0;
$initials = isset($_GET['initials']) ? $_GET['initials'] : '?';
$preview = isset($_GET['preview']);
$timestamp = isset($_GET['t']) ? intval($_GET['t']) : time();

// Define colors for different ranks
$colors = [
    1 => ['bg' => '#0a2540', 'text' => '#c19a6b'],
    2 => ['bg' => '#1a3a4f', 'text' => '#c19a6b'],
    3 => ['bg' => '#2d5a4a', 'text' => '#ffffff'],
    4 => ['bg' => '#3a5a78', 'text' => '#ffffff'],
    5 => ['bg' => '#4a6b8a', 'text' => '#ffffff'],
    6 => ['bg' => '#5a7b9a', 'text' => '#ffffff'],
    7 => ['bg' => '#6a8baa', 'text' => '#0a2540'],
    8 => ['bg' => '#7a9bba', 'text' => '#0a2540'],
    9 => ['bg' => '#8aabca', 'text' => '#0a2540'],
    10 => ['bg' => '#9abbda', 'text' => '#0a2540'],
    11 => ['bg' => '#aacbea', 'text' => '#0a2540'],
    12 => ['bg' => '#bacdf0', 'text' => '#0a2540'],
    13 => ['bg' => '#c19a6b', 'text' => '#0a2540'],
    14 => ['bg' => '#b38b5f', 'text' => '#ffffff'],
    15 => ['bg' => '#a57b53', 'text' => '#ffffff'],
    16 => ['bg' => '#976c47', 'text' => '#ffffff'],
    17 => ['bg' => '#895c3b', 'text' => '#ffffff'],
    18 => ['bg' => '#7b4d2f', 'text' => '#ffffff'],
    19 => ['bg' => '#6d3d23', 'text' => '#ffffff'],
    20 => ['bg' => '#5f2e17', 'text' => '#ffffff'],
    21 => ['bg' => '#511e0b', 'text' => '#ffffff'],
    22 => ['bg' => '#c19a6b', 'text' => '#0a2540']
];

// Get color for rank
$color = isset($colors[$rank]) ? $colors[$rank] : ['bg' => '#0a2540', 'text' => '#c19a6b'];

// Check if uploaded image exists for this rank
$uploadPath = "uploads/";
$imageFile = null;

if (is_dir($uploadPath)) {
    // Look for files with this rank in filename
    $pattern = $uploadPath . "*rank_{$rank}_*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}";
    $files = glob($pattern, GLOB_BRACE);
    
    if (!empty($files)) {
        // Sort by modification time, newest first
        usort($files, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        $imageFile = $files[0];
    }
}

if ($imageFile && file_exists($imageFile) && !$preview) {
    // Serve the uploaded image
    $ext = pathinfo($imageFile, PATHINFO_EXTENSION);
    $contentType = 'image/jpeg';
    
    switch(strtolower($ext)) {
        case 'png':
            $contentType = 'image/png';
            break;
        case 'gif':
            $contentType = 'image/gif';
            break;
        case 'webp':
            $contentType = 'image/webp';
            break;
    }
    
    // Set cache control
    header("Cache-Control: public, max-age=86400");
    header("Content-Type: $contentType");
    header("Content-Length: " . filesize($imageFile));
    readfile($imageFile);
    exit;
} else {
    // For preview mode, return JSON with info
    if ($preview) {
        header('Content-Type: application/json');
        echo json_encode([
            'rank' => $rank,
            'initials' => $initials,
            'color' => $color['bg'],
            'has_image' => ($imageFile !== null),
            'image_path' => $imageFile
        ]);
        exit;
    }
    
    // Generate SVG placeholder
    $bgColor = $color['bg'];
    $textColor = $color['text'];
    $displayInitials = htmlspecialchars($initials);
    
    // Generate SVG
    $svg = '<?xml version="1.0" encoding="UTF-8"?>';
    $svg .= '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">';
    $svg .= '<rect width="400" height="400" fill="' . $bgColor . '"/>';
    $svg .= '<text x="200" y="200" font-family="Arial" font-size="120" fill="' . $textColor . '" text-anchor="middle" dominant-baseline="middle">' . $displayInitials . '</text>';
    
    // Add rank number at bottom
    $svg .= '<text x="200" y="350" font-family="Arial" font-size="30" fill="' . $textColor . '" text-anchor="middle" opacity="0.5">Rank ' . str_pad($rank, 2, '0', STR_PAD_LEFT) . '</text>';
    $svg .= '</svg>';
    
    header('Content-Type: image/svg+xml');
    echo $svg;
    exit;
}
?>

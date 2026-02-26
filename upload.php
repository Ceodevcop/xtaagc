<?php
// upload.php - Handle staff photo uploads

header('Content-Type: application/json');

// Configuration
$uploadDir = "uploads/";
$maxFileSize = 5 * 1024 * 1024; // 5MB
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$response = ['success' => false, 'message' => '', 'files' => []];

// Create upload directory if it doesn't exist
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        $response['message'] = 'Failed to create upload directory';
        echo json_encode($response);
        exit;
    }
}

// Check if files were uploaded
if (empty($_FILES['staff_photos'])) {
    $response['message'] = 'No files uploaded';
    echo json_encode($response);
    exit;
}

$files = $_FILES['staff_photos'];
$successCount = 0;

// Process each file
for ($i = 0; $i < count($files['name']); $i++) {
    $fileName = basename($files['name'][$i]);
    $fileTmp = $files['tmp_name'][$i];
    $fileSize = $files['size'][$i];
    $fileType = $files['type'][$i];
    $fileError = $files['error'][$i];

    // Check for upload errors
    if ($fileError !== UPLOAD_ERR_OK) {
        $response['message'] .= "Error uploading $fileName. ";
        continue;
    }

    // Check file size
    if ($fileSize > $maxFileSize) {
        $response['message'] .= "$fileName exceeds 5MB limit. ";
        continue;
    }

    // Check file type
    if (!in_array($fileType, $allowedTypes)) {
        $response['message'] .= "$fileName has invalid type. ";
        continue;
    }

    // Try to extract rank from filename or use timestamp
    $rank = 0;
    if (preg_match('/rank[_\s]*(\d+)/i', $fileName, $matches)) {
        $rank = intval($matches[1]);
    }

    // Generate unique filename
    $ext = pathinfo($fileName, PATHINFO_EXTENSION);
    $newFileName = uniqid() . "_rank_{$rank}_" . time() . "." . $ext;
    $uploadPath = $uploadDir . $newFileName;

    // Move uploaded file
    if (move_uploaded_file($fileTmp, $uploadPath)) {
        $successCount++;
        $response['files'][] = [
            'original' => $fileName,
            'saved' => $newFileName,
            'rank' => $rank,
            'path' => $uploadPath
        ];
        
        // Optional: Resize image
        resizeImage($uploadPath, 400, 400);
    } else {
        $response['message'] .= "Failed to move $fileName. ";
    }
}

// Set response
if ($successCount > 0) {
    $response['success'] = true;
    $response['message'] = "$successCount file(s) uploaded successfully";
} else {
    $response['success'] = false;
    if (empty($response['message'])) {
        $response['message'] = 'No files were uploaded';
    }
}

echo json_encode($response);

// Helper function to resize image
function resizeImage($filePath, $maxWidth, $maxHeight) {
    list($width, $height, $type) = getimagesize($filePath);
    
    // Calculate new dimensions
    $ratio = min($maxWidth / $width, $maxHeight / $height);
    $newWidth = $width * $ratio;
    $newHeight = $height * $ratio;
    
    // Create image resource based on type
    switch ($type) {
        case IMAGETYPE_JPEG:
            $src = imagecreatefromjpeg($filePath);
            break;
        case IMAGETYPE_PNG:
            $src = imagecreatefrompng($filePath);
            break;
        case IMAGETYPE_GIF:
            $src = imagecreatefromgif($filePath);
            break;
        case IMAGETYPE_WEBP:
            $src = imagecreatefromwebp($filePath);
            break;
        default:
            return false;
    }
    
    // Create new image
    $dst = imagecreatetruecolor($newWidth, $newHeight);
    
    // Preserve transparency for PNG
    if ($type == IMAGETYPE_PNG) {
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
        imagefilledrectangle($dst, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    // Resize
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
    // Save based on type
    switch ($type) {
        case IMAGETYPE_JPEG:
            imagejpeg($dst, $filePath, 90);
            break;
        case IMAGETYPE_PNG:
            imagepng($dst, $filePath, 9);
            break;
        case IMAGETYPE_GIF:
            imagegif($dst, $filePath);
            break;
        case IMAGETYPE_WEBP:
            imagewebp($dst, $filePath, 90);
            break;
    }
    
    // Clean up
    imagedestroy($src);
    imagedestroy($dst);
    
    return true;
}
?>

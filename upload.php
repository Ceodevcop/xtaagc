<?php
// upload.php - Handle staff photo uploads with rank assignment

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
$totalFiles = isset($_POST['total_files']) ? intval($_POST['total_files']) : count($files['name']);
$successCount = 0;
$uploadedFiles = [];

// Process each file
for ($i = 0; $i < $totalFiles; $i++) {
    // Check if this file index exists
    if (!isset($files['name'][$i])) continue;
    
    $fileName = basename($files['name'][$i]);
    $fileTmp = $files['tmp_name'][$i];
    $fileSize = $files['size'][$i];
    $fileType = $files['type'][$i];
    $fileError = $files['error'][$i];
    
    // Get assigned rank from POST data
    $rank = isset($_POST["rank_$i"]) ? intval($_POST["rank_$i"]) : 0;
    $originalName = isset($_POST["filename_$i"]) ? $_POST["filename_$i"] : $fileName;

    // Check for upload errors
    if ($fileError !== UPLOAD_ERR_OK) {
        $response['message'] .= "Error uploading $originalName. ";
        continue;
    }

    // Check file size
    if ($fileSize > $maxFileSize) {
        $response['message'] .= "$originalName exceeds 5MB limit. ";
        continue;
    }

    // Check file type
    if (!in_array($fileType, $allowedTypes)) {
        $response['message'] .= "$originalName has invalid type. ";
        continue;
    }

    // Generate unique filename with rank and timestamp
    $ext = pathinfo($fileName, PATHINFO_EXTENSION);
    $timestamp = time();
    $newFileName = "rank_{$rank}_" . uniqid() . "_{$timestamp}." . $ext;
    $uploadPath = $uploadDir . $newFileName;

    // Move uploaded file
    if (move_uploaded_file($fileTmp, $uploadPath)) {
        $successCount++;
        $uploadedFiles[] = [
            'original' => $originalName,
            'saved' => $newFileName,
            'rank' => $rank,
            'path' => $uploadPath,
            'size' => $fileSize
        ];
        
        // Resize image to standard size
        resizeImage($uploadPath, 400, 400);
        
        // Also create a thumbnail
        $thumbPath = $uploadDir . "thumb_{$newFileName}";
        copy($uploadPath, $thumbPath);
        resizeImage($thumbPath, 150, 150);
        
    } else {
        $response['message'] .= "Failed to move $originalName. ";
    }
}

// Set response
if ($successCount > 0) {
    $response['success'] = true;
    $response['message'] = "$successCount file(s) uploaded successfully";
    $response['files'] = $uploadedFiles;
    
    // Log the upload
    $logEntry = date('Y-m-d H:i:s') . " - Uploaded " . $successCount . " files: " . json_encode($uploadedFiles) . "\n";
    file_put_contents($uploadDir . 'upload_log.txt', $logEntry, FILE_APPEND);
    
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
    $newWidth = intval($width * $ratio);
    $newHeight = intval($height * $ratio);
    
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

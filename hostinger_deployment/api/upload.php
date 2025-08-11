<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    // Check blog secret
    $blog_secret = $_POST['blog_secret'] ?? null;
    if (!verifyBlogSecret($blog_secret)) {
        sendError('Invalid or missing blog secret key', 401);
    }
    
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        sendError('No file uploaded or upload error');
    }
    
    $file = $_FILES['file'];
    
    // Validate file type
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowed_types)) {
        sendError('Only image files are allowed');
    }
    
    // Validate file size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        sendError('File size too large. Maximum 5MB allowed');
    }
    
    // Create uploads directory if it doesn't exist
    $upload_dir = '../uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = generateUUID() . '.' . strtolower($extension);
    $filepath = $upload_dir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Return the URL to the uploaded file
        $file_url = 'uploads/' . $filename;
        sendResponse(['url' => $file_url]);
    } else {
        sendError('Failed to save uploaded file');
    }
    
} catch (Exception $e) {
    error_log("Upload error: " . $e->getMessage());
    sendError('Internal server error', 500);
}
?>
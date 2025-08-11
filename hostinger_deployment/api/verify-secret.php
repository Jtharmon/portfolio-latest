<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['blog_secret'])) {
        sendResponse(['valid' => false]);
    }
    
    $secret = $input['blog_secret'];
    $is_valid = verifyBlogSecret($secret);
    
    sendResponse(['valid' => $is_valid]);
    
} catch (Exception $e) {
    error_log("Verify secret error: " . $e->getMessage());
    sendResponse(['valid' => false]);
}
?>
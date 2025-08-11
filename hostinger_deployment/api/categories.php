<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("SELECT DISTINCT category FROM blog_posts WHERE published = 1 ORDER BY category");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    sendResponse(['categories' => $categories]);
    
} catch (Exception $e) {
    error_log("Categories error: " . $e->getMessage());
    sendError('Internal server error', 500);
}
?>
<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT t.tag, COUNT(*) as count 
        FROM blog_post_tags t 
        INNER JOIN blog_posts p ON t.post_id = p.id 
        WHERE p.published = 1 
        GROUP BY t.tag 
        ORDER BY count DESC, t.tag ASC
    ");
    $stmt->execute();
    $tags = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    sendResponse(['tags' => $tags]);
    
} catch (Exception $e) {
    error_log("Tags error: " . $e->getMessage());
    sendError('Internal server error', 500);
}
?>
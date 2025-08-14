<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    // Test database connection
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT 1");
    $result = $stmt->fetch();
    
    if ($result) {
        sendResponse([
            'status' => 'healthy',
            'database' => 'connected',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        sendError('Database connection failed', 500);
    }
    
} catch (Exception $e) {
    error_log("Health check error: " . $e->getMessage());
    sendError('Health check failed', 500);
}
?>
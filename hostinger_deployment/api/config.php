<?php
// Database configuration for Hostinger
// Update these values with your Hostinger database credentials

// Database connection settings
define('DB_HOST', 'localhost'); // Usually 'localhost' on Hostinger
define('DB_NAME', 'your_database_name'); // Your Hostinger database name
define('DB_USER', 'your_username'); // Your Hostinger database username  
define('DB_PASS', 'your_password'); // Your Hostinger database password

// CORS headers for API requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database connection class
class Database {
    private $connection;
    private static $instance = null;
    
    private function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch(PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
}

// Utility functions
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function verifyBlogSecret($secret) {
    if (empty($secret)) {
        return false;
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT config_value FROM blog_config WHERE config_key = 'blog_secret'");
        $stmt->execute();
        $result = $stmt->fetch();
        
        return $result && $result['config_value'] === $secret;
    } catch (Exception $e) {
        error_log("Error verifying blog secret: " . $e->getMessage());
        return false;
    }
}

function requireBlogSecret() {
    $secret = null;
    
    // Check for secret in POST data
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $secret = $input['blog_secret'] ?? $_POST['blog_secret'] ?? null;
    }
    
    // Check for secret in query parameters (for DELETE requests)
    if (!$secret && isset($_GET['blog_secret'])) {
        $secret = $_GET['blog_secret'];
    }
    
    if (!verifyBlogSecret($secret)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or missing blog secret key']);
        exit;
    }
}

function sendResponse($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit;
}

function sendError($message, $status_code = 400) {
    http_response_code($status_code);
    echo json_encode(['error' => $message]);
    exit;
}
?>
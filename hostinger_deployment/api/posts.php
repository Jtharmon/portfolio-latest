<?php
require_once 'config.php';

try {
    $db = Database::getInstance()->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $request_uri = $_SERVER['REQUEST_URI'];
    
    // Parse the request URI to get the post ID if present
    $uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
    $post_id = null;
    
    // Find post ID in URI (looking for pattern /api/posts/{id})
    $api_index = array_search('api', $uri_parts);
    if ($api_index !== false && isset($uri_parts[$api_index + 2])) {
        $post_id = $uri_parts[$api_index + 2];
    }
    
    switch ($method) {
        case 'GET':
            if ($post_id) {
                // Get single post
                getSinglePost($db, $post_id);
            } else {
                // Get all posts with optional filters
                getAllPosts($db);
            }
            break;
            
        case 'POST':
            requireBlogSecret();
            createPost($db);
            break;
            
        case 'PUT':
            requireBlogSecret();
            updatePost($db, $post_id);
            break;
            
        case 'DELETE':
            requireBlogSecret();
            deletePost($db, $post_id);
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log("Posts API error: " . $e->getMessage());
    sendError('Internal server error', 500);
}

function getAllPosts($db) {
    $published_only = isset($_GET['published_only']) && $_GET['published_only'] === 'true';
    $category = $_GET['category'] ?? null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    
    $sql = "SELECT p.*, GROUP_CONCAT(t.tag) as tags 
            FROM blog_posts p 
            LEFT JOIN blog_post_tags t ON p.id = t.post_id";
    
    $conditions = [];
    $params = [];
    
    if ($published_only) {
        $conditions[] = "p.published = 1";
    }
    
    if ($category) {
        $conditions[] = "p.category = ?";
        $params[] = $category;
    }
    
    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }
    
    $sql .= " GROUP BY p.id ORDER BY p.created_at DESC";
    
    if ($limit) {
        $sql .= " LIMIT ?";
        $params[] = $limit;
    }
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $posts = $stmt->fetchAll();
    
    // Format the response
    $formatted_posts = array_map(function($post) {
        return [
            'id' => $post['id'],
            'title' => $post['title'],
            'content' => $post['content'],
            'excerpt' => $post['excerpt'],
            'category' => $post['category'],
            'featured_image' => $post['featured_image'],
            'published' => (bool)$post['published'],
            'tags' => $post['tags'] ? explode(',', $post['tags']) : [],
            'created_at' => $post['created_at'],
            'updated_at' => $post['updated_at']
        ];
    }, $posts);
    
    sendResponse($formatted_posts);
}

function getSinglePost($db, $post_id) {
    $stmt = $db->prepare("
        SELECT p.*, GROUP_CONCAT(t.tag) as tags 
        FROM blog_posts p 
        LEFT JOIN blog_post_tags t ON p.id = t.post_id 
        WHERE p.id = ? 
        GROUP BY p.id
    ");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch();
    
    if (!$post) {
        sendError('Post not found', 404);
    }
    
    $formatted_post = [
        'id' => $post['id'],
        'title' => $post['title'],
        'content' => $post['content'],
        'excerpt' => $post['excerpt'],
        'category' => $post['category'],
        'featured_image' => $post['featured_image'],
        'published' => (bool)$post['published'],
        'tags' => $post['tags'] ? explode(',', $post['tags']) : [],
        'created_at' => $post['created_at'],
        'updated_at' => $post['updated_at']
    ];
    
    sendResponse($formatted_post);
}

function createPost($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['title']) || !isset($input['content'])) {
        sendError('Title and content are required');
    }
    
    $post_id = generateUUID();
    $tags = $input['tags'] ?? [];
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Insert post
        $stmt = $db->prepare("
            INSERT INTO blog_posts (id, title, content, excerpt, category, featured_image, published) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $post_id,
            $input['title'],
            $input['content'],
            $input['excerpt'] ?? '',
            $input['category'] ?? 'General',
            $input['featured_image'] ?? null,
            $input['published'] ?? true
        ]);
        
        // Insert tags
        if (!empty($tags)) {
            $tag_stmt = $db->prepare("INSERT IGNORE INTO blog_post_tags (post_id, tag) VALUES (?, ?)");
            foreach ($tags as $tag) {
                $tag_stmt->execute([$post_id, trim($tag)]);
            }
        }
        
        $db->commit();
        
        // Return the created post
        getSinglePost($db, $post_id);
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
}

function updatePost($db, $post_id) {
    if (!$post_id) {
        sendError('Post ID is required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError('Invalid input data');
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Update post
        $stmt = $db->prepare("
            UPDATE blog_posts 
            SET title = ?, content = ?, excerpt = ?, category = ?, featured_image = ?, published = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $input['title'] ?? '',
            $input['content'] ?? '',
            $input['excerpt'] ?? '',
            $input['category'] ?? 'General',
            $input['featured_image'] ?? null,
            $input['published'] ?? true,
            $post_id
        ]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Post not found', 404);
        }
        
        // Update tags
        if (isset($input['tags'])) {
            // Remove existing tags
            $stmt = $db->prepare("DELETE FROM blog_post_tags WHERE post_id = ?");
            $stmt->execute([$post_id]);
            
            // Add new tags
            if (!empty($input['tags'])) {
                $tag_stmt = $db->prepare("INSERT INTO blog_post_tags (post_id, tag) VALUES (?, ?)");
                foreach ($input['tags'] as $tag) {
                    $tag_stmt->execute([$post_id, trim($tag)]);
                }
            }
        }
        
        $db->commit();
        
        // Return the updated post
        getSinglePost($db, $post_id);
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
}

function deletePost($db, $post_id) {
    if (!$post_id) {
        sendError('Post ID is required');
    }
    
    $stmt = $db->prepare("DELETE FROM blog_posts WHERE id = ?");
    $stmt->execute([$post_id]);
    
    if ($stmt->rowCount() === 0) {
        sendError('Post not found', 404);
    }
    
    sendResponse(['message' => 'Post deleted successfully']);
}
?>
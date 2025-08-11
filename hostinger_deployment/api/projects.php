<?php
require_once 'config.php';

try {
    $db = Database::getInstance()->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $request_uri = $_SERVER['REQUEST_URI'];
    
    // Parse the request URI to get the project ID if present
    $uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
    $project_id = null;
    
    // Find project ID in URI (looking for pattern /api/projects/{id})
    $api_index = array_search('api', $uri_parts);
    if ($api_index !== false && isset($uri_parts[$api_index + 2])) {
        $project_id = $uri_parts[$api_index + 2];
    }
    
    switch ($method) {
        case 'GET':
            if ($project_id) {
                // Get single project
                getSingleProject($db, $project_id);
            } else {
                // Get all projects
                getAllProjects($db);
            }
            break;
            
        case 'POST':
            requireBlogSecret();
            createProject($db);
            break;
            
        case 'PUT':
            requireBlogSecret();
            updateProject($db, $project_id);
            break;
            
        case 'DELETE':
            requireBlogSecret();
            deleteProject($db, $project_id);
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log("Projects API error: " . $e->getMessage());
    sendError('Internal server error', 500);
}

function getAllProjects($db) {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    
    $sql = "SELECT p.*, GROUP_CONCAT(t.technology) as technologies 
            FROM ai_projects p 
            LEFT JOIN project_technologies t ON p.id = t.project_id
            GROUP BY p.id ORDER BY p.created_at DESC";
    
    if ($limit) {
        $sql .= " LIMIT ?";
        $params = [$limit];
    } else {
        $params = [];
    }
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $projects = $stmt->fetchAll();
    
    // Format the response
    $formatted_projects = array_map(function($project) {
        return [
            'id' => $project['id'],
            'title' => $project['title'],
            'description' => $project['description'],
            'content' => $project['content'],
            'demo_url' => $project['demo_url'],
            'github_url' => $project['github_url'],
            'image_url' => $project['image_url'],
            'featured' => (bool)$project['featured'],
            'technologies' => $project['technologies'] ? explode(',', $project['technologies']) : [],
            'created_at' => $project['created_at'],
            'updated_at' => $project['updated_at']
        ];
    }, $projects);
    
    sendResponse($formatted_projects);
}

function getSingleProject($db, $project_id) {
    $stmt = $db->prepare("
        SELECT p.*, GROUP_CONCAT(t.technology) as technologies 
        FROM ai_projects p 
        LEFT JOIN project_technologies t ON p.id = t.project_id 
        WHERE p.id = ? 
        GROUP BY p.id
    ");
    $stmt->execute([$project_id]);
    $project = $stmt->fetch();
    
    if (!$project) {
        sendError('Project not found', 404);
    }
    
    $formatted_project = [
        'id' => $project['id'],
        'title' => $project['title'],
        'description' => $project['description'],
        'content' => $project['content'],
        'demo_url' => $project['demo_url'],
        'github_url' => $project['github_url'],
        'image_url' => $project['image_url'],
        'featured' => (bool)$project['featured'],
        'technologies' => $project['technologies'] ? explode(',', $project['technologies']) : [],
        'created_at' => $project['created_at'],
        'updated_at' => $project['updated_at']
    ];
    
    sendResponse($formatted_project);
}

function createProject($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['title']) || !isset($input['description'])) {
        sendError('Title and description are required');
    }
    
    $project_id = generateUUID();
    $technologies = $input['technologies'] ?? [];
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Insert project
        $stmt = $db->prepare("
            INSERT INTO ai_projects (id, title, description, content, demo_url, github_url, image_url, featured) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $project_id,
            $input['title'],
            $input['description'],
            $input['content'] ?? null,
            $input['demo_url'] ?? null,
            $input['github_url'] ?? null,
            $input['image_url'] ?? null,
            $input['featured'] ?? false
        ]);
        
        // Insert technologies
        if (!empty($technologies)) {
            $tech_stmt = $db->prepare("INSERT IGNORE INTO project_technologies (project_id, technology) VALUES (?, ?)");
            foreach ($technologies as $technology) {
                $tech_stmt->execute([$project_id, trim($technology)]);
            }
        }
        
        $db->commit();
        
        // Return the created project
        getSingleProject($db, $project_id);
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
}

function updateProject($db, $project_id) {
    if (!$project_id) {
        sendError('Project ID is required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError('Invalid input data');
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Update project
        $stmt = $db->prepare("
            UPDATE ai_projects 
            SET title = ?, description = ?, content = ?, demo_url = ?, github_url = ?, image_url = ?, featured = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $input['title'] ?? '',
            $input['description'] ?? '',
            $input['content'] ?? null,
            $input['demo_url'] ?? null,
            $input['github_url'] ?? null,
            $input['image_url'] ?? null,
            $input['featured'] ?? false,
            $project_id
        ]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Project not found', 404);
        }
        
        // Update technologies
        if (isset($input['technologies'])) {
            // Remove existing technologies
            $stmt = $db->prepare("DELETE FROM project_technologies WHERE project_id = ?");
            $stmt->execute([$project_id]);
            
            // Add new technologies
            if (!empty($input['technologies'])) {
                $tech_stmt = $db->prepare("INSERT INTO project_technologies (project_id, technology) VALUES (?, ?)");
                foreach ($input['technologies'] as $technology) {
                    $tech_stmt->execute([$project_id, trim($technology)]);
                }
            }
        }
        
        $db->commit();
        
        // Return the updated project
        getSingleProject($db, $project_id);
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
}

function deleteProject($db, $project_id) {
    if (!$project_id) {
        sendError('Project ID is required');
    }
    
    $stmt = $db->prepare("DELETE FROM ai_projects WHERE id = ?");
    $stmt->execute([$project_id]);
    
    if ($stmt->rowCount() === 0) {
        sendError('Project not found', 404);
    }
    
    sendResponse(['message' => 'Project deleted successfully']);
}
?>
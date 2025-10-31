<?php
// API to get currently online users (both organizations and OSA staff)
// Returns users who have logged in within the last 5 minutes

session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db.php';

// Check if admin is logged in
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

// Define online threshold (5 minutes = 300 seconds)
$onlineThreshold = 5; // minutes

try {
    $response = [
        'success' => true,
        'online_users' => [],
        'organizations' => [],
        'osa_staff' => [],
        'stats' => [
            'online_orgs' => 0,
            'online_staff' => 0,
            'total_orgs' => 0,
            'total_staff' => 0
        ]
    ];

    // Get online organizations (within last 5 minutes)
    $sql = "SELECT 
                clientid as id,
                org_name as name,
                username,
                email,
                last_login,
                status,
                TIMESTAMPDIFF(MINUTE, last_login, NOW()) as minutes_ago
            FROM client 
            WHERE status = 'active' 
                AND last_login IS NOT NULL 
                AND last_login >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
            ORDER BY last_login DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $onlineThreshold);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $user = [
            'id' => $row['id'],
            'type' => 'Organization',
            'name' => $row['name'],
            'username' => $row['username'],
            'email' => $row['email'],
            'last_login' => $row['last_login'],
            'last_activity' => $row['last_login'],
            'minutes_ago' => (int)$row['minutes_ago'],
            'status' => 'online'
        ];
        $response['online_users'][] = $user;
        $response['stats']['online_orgs']++;
    }
    $stmt->close();

    // Get online OSA staff (within last 5 minutes)
    $sql = "SELECT 
                adminid as id,
                username,
                email,
                role,
                last_login,
                status,
                TIMESTAMPDIFF(MINUTE, last_login, NOW()) as minutes_ago
            FROM admin 
            WHERE status = 'active' 
                AND last_login IS NOT NULL 
                AND last_login >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
            ORDER BY last_login DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $onlineThreshold);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $user = [
            'id' => $row['id'],
            'type' => 'OSA Staff',
            'name' => $row['username'],
            'username' => $row['username'],
            'email' => $row['email'],
            'role' => $row['role'],
            'last_login' => $row['last_login'],
            'last_activity' => $row['last_login'],
            'minutes_ago' => (int)$row['minutes_ago'],
            'status' => 'online'
        ];
        $response['online_users'][] = $user;
        $response['stats']['online_staff']++;
    }
    $stmt->close();

    // Get all organizations (for Organizations tab)
    $sql = "SELECT 
                clientid as id,
                org_name,
                username,
                email,
                last_login,
                status,
                CASE 
                    WHEN last_login IS NULL THEN NULL
                    WHEN last_login >= DATE_SUB(NOW(), INTERVAL ? MINUTE) THEN 'online'
                    ELSE 'offline'
                END as online_status
            FROM client 
            ORDER BY last_login DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $onlineThreshold);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $response['organizations'][] = [
            'id' => $row['id'],
            'org_name' => $row['org_name'],
            'username' => $row['username'],
            'email' => $row['email'],
            'last_login' => $row['last_login'],
            'status' => $row['status'],
            'online_status' => $row['online_status']
        ];
        $response['stats']['total_orgs']++;
    }
    $stmt->close();

    // Get all OSA staff (for OSA Staff tab)
    $sql = "SELECT 
                adminid as id,
                username,
                email,
                role,
                last_login,
                status,
                CASE 
                    WHEN last_login IS NULL THEN NULL
                    WHEN last_login >= DATE_SUB(NOW(), INTERVAL ? MINUTE) THEN 'online'
                    ELSE 'offline'
                END as online_status
            FROM admin 
            ORDER BY last_login DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $onlineThreshold);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $response['osa_staff'][] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'email' => $row['email'],
            'role' => $row['role'],
            'last_login' => $row['last_login'],
            'status' => $row['status'],
            'online_status' => $row['online_status']
        ];
        $response['stats']['total_staff']++;
    }
    $stmt->close();

    // Total users
    $response['stats']['total_users'] = $response['stats']['total_orgs'] + $response['stats']['total_staff'];

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch online users',
        'error' => $e->getMessage()
    ]);
}
?>

<?php
// API to update user's last_login timestamp (activity tracking)
// Called periodically to keep users marked as "online"

session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db.php';

// Read JSON input
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Check if user is logged in
if (!isset($_SESSION['user_type'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

try {
    $userType = $_SESSION['user_type'];
    $timestamp = date('Y-m-d H:i:s');

    if ($userType === 'admin') {
        // Update admin/OSA staff last_login
        $adminId = $_SESSION['adminid'];
        $stmt = $conn->prepare("UPDATE admin SET last_login = NOW() WHERE adminid = ?");
        $stmt->bind_param('i', $adminId);
        $stmt->execute();
        $stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Activity updated',
            'user_type' => 'admin',
            'timestamp' => $timestamp
        ]);

    } elseif ($userType === 'client') {
        // Update organization last_login
        $clientId = $_SESSION['clientid'];
        $stmt = $conn->prepare("UPDATE client SET last_login = NOW() WHERE clientid = ?");
        $stmt->bind_param('i', $clientId);
        $stmt->execute();
        $stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Activity updated',
            'user_type' => 'client',
            'timestamp' => $timestamp
        ]);

    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user type']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update activity',
        'error' => $e->getMessage()
    ]);
}
?>

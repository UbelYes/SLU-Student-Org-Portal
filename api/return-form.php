<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = intval($_POST['id'] ?? 0);
    $reason = trim($_POST['reason'] ?? '');
    
    if (!$id || !$reason) {
        echo json_encode(['success' => false, 'message' => 'ID and reason required']);
        exit;
    }
    
    $stmt = $conn->prepare("UPDATE submissions SET status = 'returned', return_reason = ? WHERE id = ?");
    $stmt->bind_param('si', $reason, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Form returned to organization']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to return form']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

$conn->close();
?>

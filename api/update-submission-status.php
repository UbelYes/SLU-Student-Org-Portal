<?php
/**
 * Update Submission Status API
 * 
 * Allows OSA admins to approve or return submissions for revision
 */

header('Content-Type: application/json');
session_start();

require_once 'db.php';

// Check if user is logged in as admin
if (!isset($_SESSION['adminid'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin access required.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (empty($data['submission_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Submission ID is required']);
        exit;
    }
    
    if (empty($data['status'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Status is required']);
        exit;
    }
    
    $submission_id = (int)$data['submission_id'];
    $status = $data['status'];
    $notes = isset($data['notes']) ? $data['notes'] : null;
    
    // Validate status value
    if (!in_array($status, ['Approved', 'Returned', 'Pending'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid status value']);
        exit;
    }
    
    // Update submission status
    $sql = "UPDATE org_form_submissions 
            SET status = ?, 
                updated_date = CURRENT_TIMESTAMP 
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $status, $submission_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to update submission status');
    }
    
    if ($stmt->affected_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Submission not found']);
        exit;
    }
    
    $stmt->close();
    
    // Log the action (optional - could be added to a separate audit table)
    // For now, we'll just return success
    
    echo json_encode([
        'success' => true,
        'message' => 'Submission status updated successfully',
        'submission_id' => $submission_id,
        'new_status' => $status
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error updating submission status: ' . $e->getMessage()
    ]);
}

if (isset($conn)) {
    $conn->close();
}
?>

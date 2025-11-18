<?php
header('Content-Type: application/json');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Create new submission
    $input = json_decode(file_get_contents('php://input'), true);
    
    $org_name = $conn->real_escape_string($input['org_name'] ?? '');
    $submission_title = $conn->real_escape_string($input['submission_title'] ?? '');
    $applicant_name = $conn->real_escape_string($input['applicant_name'] ?? '');
    
    if (empty($org_name) || empty($submission_title) || empty($applicant_name)) {
        echo json_encode([
            'success' => false,
            'message' => 'All fields are required'
        ]);
        exit;
    }
    
    $sql = "INSERT INTO submissions (org_name, submission_title, applicant_name) 
            VALUES ('$org_name', '$submission_title', '$applicant_name')";
    
    if ($conn->query($sql)) {
        echo json_encode([
            'success' => true,
            'message' => 'Submission created successfully',
            'id' => $conn->insert_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create submission'
        ]);
    }
    
} elseif ($method === 'DELETE') {
    // Delete submission
    $input = json_decode(file_get_contents('php://input'), true);
    $id = intval($input['id'] ?? 0);
    
    if ($id <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid ID'
        ]);
        exit;
    }
    
    $sql = "DELETE FROM submissions WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode([
            'success' => true,
            'message' => 'Submission deleted successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete submission'
        ]);
    }
    
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}

$conn->close();
?>

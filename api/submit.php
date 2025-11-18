<?php
header('Content-Type: application/json');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Create new submission
    $input = json_decode(file_get_contents('php://input'), true);
    
    /*
    Collect data from the org js when submitted. 
     */
    $submission_title = trim($input['submission_title'] ?? '');
    $org_name = trim($input['org_name'] ?? '');
    $org_acronym = trim($input['org_acronym'] ?? '');
    $org_email = trim($input['org_email'] ?? '');
    $social_media = trim($input['social_media'] ?? '');
    $applicant_name = trim($input['applicant_name'] ?? '');
    $applicant_position = trim($input['applicant_position'] ?? '');
    $applicant_email = trim($input['applicant_email'] ?? '');
    $adviser_names = trim($input['adviser_names'] ?? '');
    $adviser_emails = trim($input['adviser_emails'] ?? '');
    $organization_school = isset($input['organization_school']) && is_array($input['organization_school']) ? 
        implode(',', $input['organization_school']) : '';
    $organization_type = trim($input['organization_type'] ?? '');
    
    $events = isset($input['events']) && is_array($input['events']) ? $input['events'] : [];
    $events_json = json_encode($events);
    
    $stmt = $conn->prepare("INSERT INTO submissions (submission_title, org_name, org_acronym, org_email, 
        social_media, applicant_name, applicant_position, applicant_email, adviser_names, adviser_emails, 
        organization_school, organization_type, events_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param('sssssssssssss', $submission_title, $org_name, $org_acronym, $org_email, 
        $social_media, $applicant_name, $applicant_position, $applicant_email, $adviser_names, 
        $adviser_emails, $organization_school, $organization_type, $events_json);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Submission created successfully', 'id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create submission']);
    }
    $stmt->close();
    
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
    
    $stmt = $conn->prepare("DELETE FROM submissions WHERE id = ?");
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Submission deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete submission']);
    }
    $stmt->close();
    
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}

$conn->close();
?>

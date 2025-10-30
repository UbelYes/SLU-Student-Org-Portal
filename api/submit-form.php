<?php
header('Content-Type: application/json');
session_start();

// Include database connection
require_once 'db.php';

// Check if user is logged in
if (!isset($_SESSION['clientid'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login first.']);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = [
        'submission_title', 'org_full_name', 'org_acronym', 'org_email',
        'applicant_name', 'applicant_position', 'applicant_email',
        'adviser_names', 'adviser_emails', 'category', 'org_type',
        'cbl_status', 'video_link'
    ];
    
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }
    
    // Prepare SQL statement
    $sql = "INSERT INTO org_form_submissions (
        clientid, submission_title, org_full_name, org_acronym, org_email, 
        social_media_links, applicant_name, applicant_position, applicant_email,
        adviser_names, adviser_emails, category, org_type, cbl_status, video_link
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    
    // Bind parameters
    $stmt->bind_param(
        "issssssssssssss",
        $_SESSION['clientid'],
        $data['submission_title'],
        $data['org_full_name'],
        $data['org_acronym'],
        $data['org_email'],
        $data['social_media_links'],
        $data['applicant_name'],
        $data['applicant_position'],
        $data['applicant_email'],
        $data['adviser_names'],
        $data['adviser_emails'],
        $data['category'],
        $data['org_type'],
        $data['cbl_status'],
        $data['video_link']
    );
    
    // Execute the statement
    if ($stmt->execute()) {
        $submission_id = $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'Form submitted successfully',
            'submission_id' => $submission_id
        ]);
    } else {
        throw new Exception('Failed to submit form');
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error submitting form: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

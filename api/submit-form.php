<?php
/**
 * Organization Form Submission API
 * 
 * Handles organization form submissions from authenticated client users.
 * Validates session authentication, accepts POST JSON data, validates required fields,
 * and inserts submission into org_form_submissions table. Returns submission ID on success.
 */

header('Content-Type: application/json');
session_start();

require_once 'db.php';

if (!isset($_SESSION['clientid'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login first.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
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
    
    $sql = "INSERT INTO org_form_submissions (
        clientid, submission_title, org_full_name, org_acronym, org_email, 
        social_media_links, applicant_name, applicant_position, applicant_email,
        adviser_names, adviser_emails, category, org_type, cbl_status, video_link
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    
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

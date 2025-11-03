<?php
/**
 * Organization Form Submission API
 * 
 * Handles organization form submissions from authenticated client users.
 * Validates session authentication, accepts POST JSON data, validates required fields,
 * inserts submission into org_form_submissions table and related events into org_events table.
 * Returns submission ID on success.
 * 
 * Note: File upload functionality is planned for future implementation.
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
    
    // Validate required fields
    $required_fields = [
        'submission_title', 'org_full_name', 'org_acronym', 'org_email',
        'applicant_name', 'applicant_position', 'applicant_email',
        'adviser_names', 'adviser_emails', 'category', 'org_type',
        'cbl_status', 'events'
    ];
    
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }
    
    // Validate events array
    if (!is_array($data['events']) || count($data['events']) === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'At least one event is required']);
        exit;
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    // Insert organization submission
    $sql = "INSERT INTO org_form_submissions (
        clientid, submission_title, org_full_name, org_acronym, org_email, 
        social_media_links, applicant_name, applicant_position, applicant_email,
        adviser_names, adviser_emails, category, org_type, cbl_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    
    $stmt->bind_param(
        "isssssssssssss",
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
        $data['cbl_status']
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to submit form');
    }
    
    $submission_id = $conn->insert_id;
    $stmt->close();
    
    // Insert events
    $event_sql = "INSERT INTO org_events (
        submission_id, event_name, event_date, event_venue, 
        event_description, expected_participants, budget_estimate
    ) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $event_stmt = $conn->prepare($event_sql);
    
    foreach ($data['events'] as $event) {
        $event_stmt->bind_param(
            "issssid",
            $submission_id,
            $event['name'],
            $event['date'],
            $event['venue'],
            $event['description'],
            $event['participants'],
            $event['budget']
        );
        
        if (!$event_stmt->execute()) {
            throw new Exception('Failed to add event: ' . $event['name']);
        }
    }
    
    $event_stmt->close();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully',
        'submission_id' => $submission_id,
        'events_added' => count($data['events'])
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn)) {
        $conn->rollback();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error submitting form: ' . $e->getMessage()
    ]);
}

if (isset($conn)) {
    $conn->close();
}
?>

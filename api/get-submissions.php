<?php
/**
 * Get Organization Form Submissions API
 * 
 * Retrieves organization form submissions with associated event details.
 * Organizations see only their own submissions, OSA staff see all submissions.
 */

header('Content-Type: application/json');
session_start();

// Include database connection
require_once 'db.php';

// Check if user is logged in
if (!isset($_SESSION['clientid']) && !isset($_SESSION['adminid'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login first.']);
    exit;
}

try {
    // Build SQL query based on user type
    if (isset($_SESSION['clientid'])) {
        // For organizations - show only their own submissions
        $sql = "SELECT 
                    s.id, s.submission_title, s.org_full_name, s.org_acronym, 
                    s.org_email, s.social_media_links, s.applicant_name, 
                    s.applicant_position, s.applicant_email, s.adviser_names, 
                    s.adviser_emails, s.category, s.org_type, s.cbl_status, 
                    s.status, s.feedback, s.attachment_path, s.submitted_date, s.updated_date,
                    c.org_name, c.username
                FROM org_form_submissions s
                INNER JOIN client c ON s.clientid = c.clientid
                WHERE s.clientid = ?
                ORDER BY s.submitted_date DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $_SESSION['clientid']);
    } else {
        // For OSA staff - show all submissions
        $sql = "SELECT 
                    s.id, s.submission_title, s.org_full_name, s.org_acronym, 
                    s.org_email, s.social_media_links, s.applicant_name, 
                    s.applicant_position, s.applicant_email, s.adviser_names, 
                    s.adviser_emails, s.category, s.org_type, s.cbl_status, 
                    s.status, s.feedback, s.attachment_path, s.submitted_date, s.updated_date,
                    c.org_name, c.username
                FROM org_form_submissions s
                INNER JOIN client c ON s.clientid = c.clientid
                ORDER BY s.submitted_date DESC";
        
        $stmt = $conn->prepare($sql);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $submissions = [];
    while ($row = $result->fetch_assoc()) {
        $submission_id = $row['id'];
        
        // Get events for this submission
        $event_sql = "SELECT 
                        event_id, event_name, event_date, event_venue, 
                        event_description, expected_participants, budget_estimate
                      FROM org_events
                      WHERE submission_id = ?
                      ORDER BY event_date ASC";
        
        $event_stmt = $conn->prepare($event_sql);
        $event_stmt->bind_param("i", $submission_id);
        $event_stmt->execute();
        $event_result = $event_stmt->get_result();
        
        $events = [];
        while ($event_row = $event_result->fetch_assoc()) {
            $events[] = $event_row;
        }
        $event_stmt->close();
        
        // Add events to submission data
        $row['events'] = $events;
        $row['event_count'] = count($events);
        
        $submissions[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'submissions' => $submissions,
        'total' => count($submissions)
    ]);
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving submissions: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

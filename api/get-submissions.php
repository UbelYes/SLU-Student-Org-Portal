<?php
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
                    s.video_link, s.status, s.submitted_date, s.updated_date,
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
                    s.video_link, s.status, s.submitted_date, s.updated_date,
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

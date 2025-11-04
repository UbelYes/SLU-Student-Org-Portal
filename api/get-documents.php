<?php
/**
 * Get Documents API
 * Retrieves all uploaded attachments from form submissions
 * Used by OSA staff to view and manage documents
 */

header('Content-Type: application/json');
session_start();

// Include database connection
require_once 'db.php';

// Check if user is logged in as admin
if (!isset($_SESSION['adminid'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin access required.']);
    exit;
}

try {
    // Get search and sort parameters
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'date-newest';
    
    // Build SQL query to get submissions with attachments
    $sql = "SELECT 
                s.id,
                s.submission_title,
                s.attachment_path,
                s.submitted_date,
                s.status,
                c.org_name,
                c.username
            FROM org_form_submissions s
            INNER JOIN client c ON s.clientid = c.clientid
            WHERE s.attachment_path IS NOT NULL AND s.attachment_path != ''";
    
    // Add search filter
    if (!empty($search)) {
        $sql .= " AND (s.submission_title LIKE ? OR c.org_name LIKE ? OR s.attachment_path LIKE ?)";
    }
    
    // Add sorting
    switch ($sort) {
        case 'date-oldest':
            $sql .= " ORDER BY s.submitted_date ASC";
            break;
        case 'name-az':
            $sql .= " ORDER BY s.submission_title ASC";
            break;
        case 'name-za':
            $sql .= " ORDER BY s.submission_title DESC";
            break;
        case 'org':
            $sql .= " ORDER BY c.org_name ASC";
            break;
        case 'date-newest':
        default:
            $sql .= " ORDER BY s.submitted_date DESC";
            break;
    }
    
    $stmt = $conn->prepare($sql);
    
    if (!empty($search)) {
        $searchParam = "%$search%";
        $stmt->bind_param("sss", $searchParam, $searchParam, $searchParam);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $documents = [];
    while ($row = $result->fetch_assoc()) {
        // Get file info
        $filePath = '../' . $row['attachment_path'];
        $fileSize = file_exists($filePath) ? filesize($filePath) : 0;
        $fileExtension = pathinfo($row['attachment_path'], PATHINFO_EXTENSION);
        $fileName = basename($row['attachment_path']);
        
        $documents[] = [
            'id' => $row['id'],
            'submission_id' => $row['id'],
            'submission_title' => $row['submission_title'],
            'file_name' => $fileName,
            'file_path' => $row['attachment_path'],
            'file_size' => $fileSize,
            'file_extension' => $fileExtension,
            'uploaded_date' => $row['submitted_date'],
            'organization' => $row['org_name'],
            'username' => $row['username'],
            'status' => $row['status']
        ];
    }
    
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'documents' => $documents,
        'count' => count($documents)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving documents: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

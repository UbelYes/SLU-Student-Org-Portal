<?php
/**
 * Get Documents API
 * Retrieves all uploaded documents from organizations
 * Used by OSA staff to view and manage documents
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Include database connection
require_once 'db.php';

try {
    // Get optional filters from query parameters
    $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
    $sortBy = isset($_GET['sort']) ? $_GET['sort'] : 'date-newest';
    
    // Build the SQL query
    $sql = "SELECT 
                d.id,
                d.document_type,
                d.file_name,
                d.file_path,
                d.file_size,
                d.file_extension,
                d.uploaded_date,
                d.uploaded_by,
                s.submission_title,
                s.org_acronym,
                s.status as submission_status
            FROM org_documents d
            INNER JOIN org_form_submissions s ON d.submission_id = s.id
            WHERE 1=1";
    
    // Add search filter if provided
    if (!empty($searchTerm)) {
        $sql .= " AND (d.file_name LIKE ? OR d.document_type LIKE ? OR d.uploaded_by LIKE ?)";
    }
    
    // Add sorting
    switch ($sortBy) {
        case 'date-oldest':
            $sql .= " ORDER BY d.uploaded_date ASC";
            break;
        case 'name-az':
            $sql .= " ORDER BY d.file_name ASC";
            break;
        case 'name-za':
            $sql .= " ORDER BY d.file_name DESC";
            break;
        case 'org':
            $sql .= " ORDER BY d.uploaded_by ASC, d.uploaded_date DESC";
            break;
        case 'date-newest':
        default:
            $sql .= " ORDER BY d.uploaded_date DESC";
            break;
    }
    
    // Prepare and execute query
    $stmt = $conn->prepare($sql);
    
    if (!empty($searchTerm)) {
        $searchParam = "%{$searchTerm}%";
        $stmt->bind_param("sss", $searchParam, $searchParam, $searchParam);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $documents = [];
    while ($row = $result->fetch_assoc()) {
        $documents[] = [
            'id' => (int)$row['id'],
            'documentType' => $row['document_type'],
            'fileName' => $row['file_name'],
            'filePath' => $row['file_path'],
            'fileSize' => (int)$row['file_size'],
            'fileExtension' => $row['file_extension'],
            'uploadedDate' => $row['uploaded_date'],
            'uploadedBy' => $row['uploaded_by'],
            'submissionTitle' => $row['submission_title'],
            'orgAcronym' => $row['org_acronym'],
            'submissionStatus' => $row['submission_status']
        ];
    }
    
    $stmt->close();
    $conn->close();
    
    // Return success response
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
?>

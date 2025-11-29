<?php
// ------------------------------------------------------------------
// read.php
// - Returns submission records as JSON
// - If `id` query param is provided, returns a single `record`, otherwise returns `records` (all)
// - Sets cache-control header to discourage browsers/intermediate caches
// ------------------------------------------------------------------

header('Content-Type: application/json');
// Prevent browsers/intermediate caches from storing API responses
header('Cache-Control: no-store');
require_once 'db.php';

// If an `id` is present in the query string, return that specific submission
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $sql = "SELECT * FROM submissions WHERE id = $id";
    $result = $conn->query($sql);
    
    if ($result && $row = $result->fetch_assoc()) {
        echo json_encode([
            'success' => true,
            'record' => $row
        ]);
    } else {
        // Record not found
        echo json_encode([
            'success' => false,
            'message' => 'Record not found'
        ]);
    }
} else {
    // No id provided: return all submissions ordered by newest first
    $sql = "SELECT * FROM submissions ORDER BY created_at DESC";
    $result = $conn->query($sql);

    if ($result) {
        $records = [];
        while ($row = $result->fetch_assoc()) {
            $records[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'records' => $records
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch records'
        ]);
    }
}

$conn->close();
?>

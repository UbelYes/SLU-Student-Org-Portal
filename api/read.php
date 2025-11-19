<?php
header('Content-Type: application/json');
require_once 'db.php';

// Check if requesting a single record
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
        echo json_encode([
            'success' => false,
            'message' => 'Record not found'
        ]);
    }
} else {
    // Read all submissions
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

<?php
header('Content-Type: application/json');
require_once 'db.php';

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

$conn->close();
?>

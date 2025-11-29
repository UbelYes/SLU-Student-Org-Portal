<?php
// ------------------------------------------------------------------
// Database connection helper
// - Central place to configure MySQL connection for all API scripts
// - On failure it returns a JSON error and exits (useful for API endpoints)
// ------------------------------------------------------------------

// Update these values to match your local MySQL setup
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'simple_portal';

// Make mysqli throw exceptions on errors so we can handle them cleanly
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // Create mysqli connection and set UTF-8 charset
    $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
    $conn->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    // If connection fails, return JSON error (API-friendly) and stop
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e->getMessage()]);
    exit;
}
?>

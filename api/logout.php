<?php
session_start();
header('Content-Type: application/json');

// Handle logout request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

// Handle session check request
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode([
        'success' => true,
        'logged_in' => true,
        'user' => [
            'email' => $_SESSION['user_email'] ?? '',
            'type' => $_SESSION['user_type'] ?? '',
            'name' => $_SESSION['user_name'] ?? ''
        ]
    ]);
} else {
    echo json_encode(['success' => true, 'logged_in' => false]);
}
?>

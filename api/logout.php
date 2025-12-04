<?php
session_start();
header('Content-Type: application/json');
// Prevent browsers/intermediate caches from storing session-check and logout responses
header('Cache-Control: no-store');
require_once 'db.php';

// ------------------------------------------------------------------
// Mark inactive users offline (>5 minutes)
// This is a lightweight housekeeping step run on each request to this file
$conn->query("UPDATE users SET is_online = 0 WHERE last_activity < DATE_SUB(NOW(), INTERVAL 5 MINUTE)");

// -----------------------------
// Logout (POST)
// - If the method is POST, set the user's `is_online` flag to 0, destroy session,
//   and return success JSON.
// -----------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_SESSION['user_email'])) {
        $stmt = $conn->prepare("UPDATE users SET is_online = 0 WHERE email = ?");
        $stmt->bind_param("s", $_SESSION['user_email']);
        $stmt->execute();
    }
    // Clear PHP session data and destroy the session cookie/server-side data
    session_unset();
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

// -----------------------------
// Admin: fetch all accounts with status (GET ?accounts)
// - Only allowed when the current PHP session user is an admin
// -----------------------------
if (isset($_GET['accounts']) && isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'admin') {
    $result = $conn->query("SELECT email, user_type, name, last_activity, is_online FROM users ORDER BY is_online DESC, created_at DESC");
    $accounts = [];
    while ($row = $result->fetch_assoc()) {
        $accounts[] = [
            'email' => $row['email'],
            'user_type' => $row['user_type'],
            'name' => $row['name'],
            'last_activity' => $row['last_activity'],
            'status' => $row['is_online'] ? 'online' : 'offline'
        ];
    }
    echo json_encode(['success' => true, 'accounts' => $accounts]);
    exit;
}

// -----------------------------
// Activity update for active sessions
// - If the session is active, update last_activity to now so user is shown online
// -----------------------------
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    $stmt = $conn->prepare("UPDATE users SET last_activity = NOW() WHERE email = ?");
    $stmt->bind_param("s", $_SESSION['user_email']);
    $stmt->execute();
}

// -----------------------------
// Session check (GET)
// - Returns `logged_in: true/false` and user info when available
// -----------------------------
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

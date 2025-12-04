<?php
// ------------------------------------------------------------------
// Login endpoint
// - Expects JSON POST body: { email, password }
// - Starts session, validates credentials, sets $_SESSION values on success
// - Returns JSON response with `success` and `user` on success
// ------------------------------------------------------------------

session_start();
header('Content-Type: application/json');
// Prevent caching of login responses (sensitive information)
header('Cache-Control: no-store');
require_once 'db.php';

// Read JSON body (php://input) and extract credentials
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Basic validation
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

// NOTE: passwords are compared directly in this simple example.
// In production you must use password_hash()/password_verify() and secure storage.
try {
    // Use prepared statement to avoid SQL injection for the email/password fields
    $stmt = $conn->prepare("SELECT id, email, user_type, name FROM users WHERE email = ? AND password = ?");
    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // Force logout any existing session by setting is_online to 0 first
        $stmt = $conn->prepare("UPDATE users SET is_online = 0 WHERE id = ?");
        $stmt->bind_param("i", $row['id']);
        $stmt->execute();
        
        // Store user data in session (server-side authoritative state)
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['user_email'] = $row['email'];
        $_SESSION['user_type'] = $row['user_type'];
        $_SESSION['user_name'] = $row['name'];
        $_SESSION['logged_in'] = true;
        
        // Update user status to online and record last activity
        $stmt = $conn->prepare("UPDATE users SET is_online = 1, last_activity = NOW() WHERE id = ?");
        $stmt->bind_param("i", $row['id']);
        $stmt->execute();
        
        // Return user info to the client (client will store small UI state only)
        echo json_encode([
            'success' => true,
            'user' => [
                'email' => $row['email'],
                'type' => $row['user_type'],
                'name' => $row['name']
            ]
        ]);
    } else { 
        // Credentials invalid
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
} catch (Exception $e) {
    // Generic error response for unexpected failures
    echo json_encode(['success' => false, 'message' => 'Login error']);
}
?>

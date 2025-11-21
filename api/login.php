<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT id, email, user_type, name FROM users WHERE email = ? AND password = ?");
    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // Store user data in session
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['user_email'] = $row['email'];
        $_SESSION['user_type'] = $row['user_type'];
        $_SESSION['user_name'] = $row['name'];
        $_SESSION['logged_in'] = true;
        
        // Update user status to online
        $stmt = $conn->prepare("UPDATE users SET is_online = 1, last_activity = NOW() WHERE email = ?");
        $stmt->bind_param("s", $row['email']);
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'user' => [
                'email' => $row['email'],
                'type' => $row['user_type'],
                'name' => $row['name']
            ]
        ]);
    } else { 
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Login error']);
}
?>

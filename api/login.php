<?php
// Minimal login endpoint: checks Admin (incl. OSA) and Client accounts
// Input: POST { email, password } (form-encoded or JSON)
// Output: JSON { success, role, name, org?, redirectPath, message? }

session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db.php';

// Read input (supports JSON or form-encoded)
$raw = file_get_contents('php://input');
$data = [];
if (!empty($raw)) {
    $decoded = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        $data = $decoded;
    }
}

$email = isset($data['email']) ? trim($data['email']) : (isset($_POST['email']) ? trim($_POST['email']) : '');
$password = isset($data['password']) ? (string)$data['password'] : (isset($_POST['password']) ? (string)$_POST['password'] : '');

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

// Helper: verify hashed or plaintext (supports transition)
function verify_password_flexible(string $input, string $stored): bool {
    // Try password_verify first (bcrypt/argon2), then fallback to direct compare
    if (strlen($stored) >= 4 && substr($stored, 0, 1) === '$') {
        return password_verify($input, $stored);
    }
    return hash_equals($stored, $input);
}

// Try Admin/OSA first
try {
    $stmt = $conn->prepare("SELECT adminid, username, password, email, role FROM admin WHERE email = ? AND status = 'active' LIMIT 1");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        if (verify_password_flexible($password, $row['password'])) {
            // Map DB role to frontend roles and redirect
            $dbRole = $row['role'];
            $role = ($dbRole === 'osa_admin') ? 'osa' : 'admin';
            $redirect = ($role === 'osa') ? './osa-staff/osa-forms.html' : './admin/admin-dashboard.html';

            $_SESSION['user_type'] = 'admin';
            $_SESSION['adminid'] = (int)$row['adminid'];
            $_SESSION['role'] = $role;
            $_SESSION['email'] = $row['email'];
            $_SESSION['username'] = $row['username'];

            echo json_encode([
                'success' => true,
                'role' => $role,
                'name' => $row['username'],
                'redirectPath' => $redirect
            ]);
            exit;
        }
    }
    $stmt->close();

    // Try Client (student organizations)
    $stmt2 = $conn->prepare("SELECT clientid, org_name, username, password, email FROM client WHERE email = ? AND status = 'active' LIMIT 1");
    $stmt2->bind_param('s', $email);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    if ($row2 = $res2->fetch_assoc()) {
        if (verify_password_flexible($password, $row2['password'])) {
            $_SESSION['user_type'] = 'client';
            $_SESSION['clientid'] = (int)$row2['clientid'];
            $_SESSION['role'] = 'student';
            $_SESSION['email'] = $row2['email'];
            $_SESSION['username'] = $row2['username'];
            $_SESSION['org_name'] = $row2['org_name'];

            echo json_encode([
                'success' => true,
                'role' => 'student',
                'name' => $row2['org_name'],
                'org' => $row2['org_name'],
                'redirectPath' => './org/org-dashboard.html'
            ]);
            exit;
        }
    }
    $stmt2->close();

    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Login failed.', 'error' => $e->getMessage()]);
    exit;
}

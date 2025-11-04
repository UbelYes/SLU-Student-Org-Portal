<?php

/**
 * Organization Form Submission API
 * 
 * Handles organization form submissions from authenticated client users.
 * Validates session authentication, accepts POST data (multipart/form-data for file upload),
 * validates required fields, handles file upload, inserts submission into org_form_submissions 
 * table and related events into org_events table. Returns submission ID on success.
 */

header('Content-Type: application/json');
session_start();

require_once 'db.php';

if (!isset($_SESSION['clientid'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login first.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Check if file upload or JSON
    if (isset($_FILES['attachment']) || !empty($_POST)) {
        // Handle multipart/form-data (with file upload)
        $data = $_POST;

        // Parse events JSON if it's a string
        if (isset($data['events']) && is_string($data['events'])) {
            $data['events'] = json_decode($data['events'], true);
        }
    } else {
        // Handle JSON request (backward compatibility)
        $data = json_decode(file_get_contents('php://input'), true);
    }

    // Validate required fields
    $required_fields = [
        'submission_title',
        'org_full_name',
        'org_acronym',
        'org_email',
        'applicant_name',
        'applicant_position',
        'applicant_email',
        'adviser_names',
        'adviser_emails',
        'category',
        'org_type',
        'cbl_status',
        'events'
    ];

    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }

    // Validate events array
    if (!is_array($data['events']) || count($data['events']) === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'At least one event is required']);
        exit;
    }

    // Handle file upload
    $attachment_path = null;
    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../uploads/';
        $allowed_types = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ];
        $allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png'];
        $max_size = 10 * 1024 * 1024; // 10MB

        $file_type = $_FILES['attachment']['type'];
        $file_size = $_FILES['attachment']['size'];
        $file_name = $_FILES['attachment']['name'];
        $file_extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        // Debug logging
        error_log("File upload attempt - Name: $file_name, Type: $file_type, Extension: $file_extension, Size: $file_size");

        // Validate file extension (more reliable than MIME type)
        if (!in_array($file_extension, $allowed_extensions)) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => "Invalid file type. Only PDF and Images (JPG, PNG) are allowed. Detected extension: $file_extension"
            ]);
            exit;
        }

        // Validate file size
        if ($file_size > $max_size) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'File size exceeds 10MB limit.']);
            exit;
        }

        // Additional validation for PDF files
        if ($file_extension === 'pdf') {
            // Check file signature (magic bytes) for PDF
            $file_handle = fopen($_FILES['attachment']['tmp_name'], 'rb');
            $file_header = fread($file_handle, 4);
            fclose($file_handle);
            
            if (substr($file_header, 0, 4) !== '%PDF') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid PDF file. The file appears to be corrupted or not a valid PDF.']);
                exit;
            }
        }

        // Validate file type as secondary check
        if (!in_array($file_type, $allowed_types)) {
            // Log warning but don't fail - some browsers send incorrect MIME types
            error_log("Warning: File uploaded with MIME type: $file_type for extension: $file_extension");
        }

        // Generate unique filename
        $unique_filename = uniqid('submission_', true) . '.' . $file_extension;
        $upload_path = $upload_dir . $unique_filename;

        // Move uploaded file
        if (move_uploaded_file($_FILES['attachment']['tmp_name'], $upload_path)) {
            $attachment_path = 'uploads/' . $unique_filename;
            error_log("File uploaded successfully: $attachment_path");
        } else {
            error_log("Failed to move uploaded file from " . $_FILES['attachment']['tmp_name'] . " to $upload_path");
            throw new Exception('Failed to upload file');
        }
    } else if (isset($_FILES['attachment'])) {
        // Log upload errors
        $error_code = $_FILES['attachment']['error'];
        error_log("File upload error code: $error_code");
        
        if ($error_code !== UPLOAD_ERR_NO_FILE) {
            $error_messages = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize in php.ini',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE in HTML form',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'File upload stopped by PHP extension'
            ];
            
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'File upload error: ' . ($error_messages[$error_code] ?? 'Unknown error')
            ]);
            exit;
        }
    }

    // Start transaction
    $conn->begin_transaction();

    // Insert organization submission
    $sql = "INSERT INTO org_form_submissions (
        clientid, submission_title, org_full_name, org_acronym, org_email, 
        social_media_links, applicant_name, applicant_position, applicant_email,
        adviser_names, adviser_emails, category, org_type, cbl_status, attachment_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "issssssssssssss",
        $_SESSION['clientid'],
        $data['submission_title'],
        $data['org_full_name'],
        $data['org_acronym'],
        $data['org_email'],
        $data['social_media_links'],
        $data['applicant_name'],
        $data['applicant_position'],
        $data['applicant_email'],
        $data['adviser_names'],
        $data['adviser_emails'],
        $data['category'],
        $data['org_type'],
        $data['cbl_status'],
        $attachment_path
    );

    if (!$stmt->execute()) {
        throw new Exception('Failed to submit form');
    }

    $submission_id = $conn->insert_id;
    $stmt->close();

    // Insert events
    $event_sql = "INSERT INTO org_events (
        submission_id, event_name, event_date, event_venue, 
        event_description, expected_participants, budget_estimate
    ) VALUES (?, ?, ?, ?, ?, ?, ?)";

    $event_stmt = $conn->prepare($event_sql);

    foreach ($data['events'] as $event) {
        $event_stmt->bind_param(
            "issssid",
            $submission_id,
            $event['name'],
            $event['date'],
            $event['venue'],
            $event['description'],
            $event['participants'],
            $event['budget']
        );

        if (!$event_stmt->execute()) {
            throw new Exception('Failed to add event: ' . $event['name']);
        }
    }

    $event_stmt->close();

    // Commit transaction
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully',
        'submission_id' => $submission_id,
        'events_added' => count($data['events']),
        'attachment_uploaded' => !empty($attachment_path)
    ]);
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn)) {
        $conn->rollback();
    }

    // Delete uploaded file if transaction fails
    if (isset($attachment_path) && file_exists('../' . $attachment_path)) {
        unlink('../' . $attachment_path);
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error submitting form: ' . $e->getMessage()
    ]);
}

if (isset($conn)) {
    $conn->close();
}

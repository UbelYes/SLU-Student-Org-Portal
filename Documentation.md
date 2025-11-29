# Project Documentation

This document provides a short, clear walkthrough of every file in the repository, plus short explanations of the main technologies used (PHP sessions, AJAX, Express admin server). Keep it handy for reviewers and maintainers.

Format: For each file/folder we list the purpose and short description of the main code blocks.

## Table of contents

- [Top-level files](#top-level-files)
- [api/ (PHP backend)](#api-php-backend)
  - [api/db.php](#apidbphp)
  - [api/login.php](#apiloginphp)
  - [api/logout.php](#apilogoutphp)
  - [api/read.php](#apireadphp)
  - [api/submit.php](#apisubmitphp)
- [admin/ (Node/Express admin server)](#admin-nodeexpress-admin-server)
- [pages/ (frontend pages)](#pages-frontend-pages)
- [scripts/ (client-side JavaScript)](#scripts-client-side-javascript)
  - [scripts/login.js](#scriptsloginjs)
  - [scripts/org-portal.js](#scriptsorg-portaljs)
  - [scripts/osa-portal.js](#scriptsosa-portaljs)
  - [scripts/pdf-utils.js](#scriptspdf-utilsjs)
- [styles/, resources/, uploads/](#styles-resources-uploads)
- [sql/312team-unbelibables.sql](#sql312team-unbelibablesql)

## Top-level files

- `index.html`
  - Login page. Contains the login form and includes `scripts/login.js` which handles login submission and client-side routing.

- `README.md`
  - Quick start and run instructions. Short overview of how to run the project locally (WAMP + optional Node admin server).

- `Documentation.md`
  - This file.

- `TODO.md`
  - Project tasks and notes.

---

## `api/` (PHP backend)

All files here are PHP endpoints that interact with the MySQL database and manage sessions.

- `api/db.php`
  - Database connection helper.
  - Contains connection variables (host, user, password, database) and creates `$conn` (mysqli) used by other API files.

- `api/login.php`
  - Handles login requests (expects JSON POST with `email` and `password`).
  - Flow:
    1. `session_start()` to enable PHP sessions.
    2. Sets `Content-Type: application/json` and `Cache-Control: no-store`.
    3. Reads JSON body, validates credentials by querying `users` table.
    4. On success: sets `$_SESSION` keys (`user_id`, `user_email`, `user_type`, `user_name`, `logged_in`), updates `is_online` and `last_activity` in DB, returns JSON with `success: true` and user info.
    5. On failure: returns `success: false` with message.
  - Security notes: passwords appear compared directly (no hashing). In production, use password hashing and prepared statements carefully (currently uses prepared statements but no hashing).

  Example (key `login.php` flow — simplified):

```php
<?php
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store');

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

// prepared statement to find matching user (note: password should be hashed in real apps)
$stmt = $conn->prepare("SELECT id, email, user_type, name FROM users WHERE email = ? AND password = ?");
$stmt->bind_param("ss", $email, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // set session values
    $_SESSION['user_id'] = $row['id'];
    $_SESSION['user_email'] = $row['email'];
    $_SESSION['user_type'] = $row['user_type'];
    $_SESSION['user_name'] = $row['name'];
    $_SESSION['logged_in'] = true;

    // mark online and return user info
    $stmt = $conn->prepare("UPDATE users SET is_online = 1, last_activity = NOW() WHERE email = ?");
    $stmt->bind_param("s", $row['email']);
    $stmt->execute();

    echo json_encode(['success' => true, 'user' => ['email' => $row['email'],'type' => $row['user_type'],'name' => $row['name']]]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
}
```

- `api/logout.php`
  - Manages logout and session checks.
  - Flow:
    1. `session_start()` and `Content-Type: application/json`.
    2. Marks inactive users offline (DB update for last_activity older than 5 minutes).
    3. If `POST` (logout): sets `is_online = 0` for the user, calls `session_unset()` and `session_destroy()`, returns JSON `success: true`.
    4. If `GET` (session check): returns JSON `{'success': true, 'logged_in': true/false, 'user': {...}}` depending on `$_SESSION` state.

  Example (key `logout.php` flow — simplified):

```php
<?php
session_start();
header('Content-Type: application/json');

// optional: mark inactive users offline
$conn->query("UPDATE users SET is_online = 0 WHERE last_activity < DATE_SUB(NOW(), INTERVAL 5 MINUTE)");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_SESSION['user_email'])) {
        $stmt = $conn->prepare("UPDATE users SET is_online = 0 WHERE email = ?");
        $stmt->bind_param("s", $_SESSION['user_email']);
        $stmt->execute();
    }
    session_unset();
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

// session check (GET): return logged_in and user info
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode(['success' => true, 'logged_in' => true, 'user' => ['email' => $_SESSION['user_email'] ?? '','type' => $_SESSION['user_type'] ?? '','name' => $_SESSION['user_name'] ?? '']]);
} else {
    echo json_encode(['success' => true, 'logged_in' => false]);
}
```

- `api/read.php`
  - Returns submissions or specific record(s) as JSON.
  - Handles `GET` queries (all records or by `id`) and returns `success` and `records` or single `record`.

- `api/submit.php`
  - Accepts form submissions (POST). Uses `$_FILES` and `$_POST` to insert new submission into DB, handles file upload to `uploads/`.
  - Returns JSON `success` and message or error.

Technology notes for `api/`:
- Sessions: endpoints call `session_start()` to maintain per-browser session state. PHP stores session id in a cookie; server-side `$_SESSION` is authoritative.
- Responses: API endpoints return JSON with `Content-Type: application/json`.
- Cache control: `login.php` sets `Cache-Control: no-store` to avoid sensitive responses being cached by browsers.

---

## `admin/` (Optional Node/Express admin server and UI)

Files in `admin/` provide a small Express app used for admin-specific tooling. These should not be modified per instructions.

- `admin/server.js`
  - Express server setup.
  - Middlewares:
    - `cors()` configured for local origins
    - `express.json()` for JSON body parsing
    - `express.static()` for serving static admin files
    - `express-session` for session handling
    - A small middleware sets `Cache-Control: no-store` for admin responses.
  - Routes:
    - `POST /api/admin/login` — authenticates admin users and starts a session (stores `req.session.user`).
    - `GET /api/admin/session` — returns session user info when authenticated.
    - `GET /api/admin/accounts` — returns all users (for dashboard display).
    - `POST /api/admin/logout` — destroys session and marks user offline.

- `admin/admin-login.js`
  - Client-side JS for the admin login form.
  - Handles `handleLogin(event)`: prevents default submit, reads email/password, `fetch('/api/admin/login')` with `credentials: 'include'`, stores user info in `sessionStorage` and navigates to `admin-portal.html` on success.

- `admin/admin-portal.js`
  - Client-side dashboard logic.
  - `checkAdminAuth()` calls `/api/admin/session` with `credentials: 'include'` to verify session cookie; redirects to login if invalid.
  - `handleLogout()` posts to `/api/admin/logout`, clears `sessionStorage`, and `location.replace('admin-login.html')` to prevent back navigation.
  - Dashboard initialization uses `DOMContentLoaded` to call `loadAccounts()` and periodically refreshes data.
  - `loadAccounts()` fetches `/api/admin/accounts` and uses `displayAccounts()` and `updateStats()` to render the dashboard.

- `admin/admin-login.html`, `admin/admin-portal.html`
  - Admin UI pages that include the above scripts and reference static assets.

Note: Admin server uses Node sessions (express-session). Admin and PHP sessions are separate systems; admin server primarily used for local admin tools.

---

## `pages/` (frontend pages)

- `pages/org-portal.html`
  - Organization portal page that includes `scripts/org-portal.js`.
  - Contains HTML markup for forms, submissions table, and other UI elements.

- `pages/osa-portal.html`
  - OSA staff portal page that includes `scripts/osa-portal.js`.
  - Contains UI for viewing forms, documents, and printing PDFs.

Both pages rely on client-side session checks (AJAX calls to `api/logout.php` or admin session endpoints) to ensure only authenticated users can view them.

---

## `scripts/` (client-side JavaScript)

- `scripts/login.js`
  - Handles the login form on `index.html`.
  - `handleLogin(event)` reads the email/password and `fetch('/api/login.php')` (POST JSON).
  - On success the server sets the PHP session and response includes `user` info. Client stores `userEmail`, `userType`, and `userName` in `sessionStorage` for UI use and redirects based on type.
  - Note: The server-side session is the authority for authenticated state. The client storage is for convenience only.

- `scripts/org-portal.js`
  - Protects Org portal pages:
    - `checkAuth()` calls `/api/logout.php` (GET) to confirm session and user type `org`; redirects to `/index.html` if invalid.
    - Uses `pageshow` handler to re-check when restored from the back-forward cache (bfcache).
  - `handleLogout()` posts to `/api/logout.php` (POST) to destroy the server session, clears `sessionStorage`, and uses `location.replace('/index.html')` to prevent back navigation.
  - DOM initialization (one `DOMContentLoaded` handler) wires hamburger menu, populates user info, calls `loadSubmissions()` and polls every 10s.
  - `submitForm(event)` builds a `FormData`, serializes event entries, attaches file if present, posts to `/api/submit.php`, and reloads submissions on success.
  - `loadSubmissions()` calls `/api/read.php` and populates the submissions table via `displayRecords()`.
  - `viewPDF(id)` fetches a single record and opens a print window using `generatePDFHTML()` from `pdf-utils.js`.

- `scripts/osa-portal.js`
  - Similar to `org-portal.js` but for `osa` user type.
  - `checkAuth()` verifies the session and user type `osa`.
  - `handleLogout()` posts to logout and redirects.
  - Initialization (`DOMContentLoaded`) calls `loadSubmissions()` (polls) and `loadDocuments()`.
  - `displayForms()` and `displayDocuments()` render lists and attach action buttons.

- `scripts/pdf-utils.js`
  - Helper to generate printable HTML for a submission record in `viewPDF()`.
  - Exports `generatePDFHTML(record)` which returns a string of HTML used in `window.open()` for printing.

Technologies used in client scripts:
- AJAX/fetch: used for all server communication (`fetch` with JSON or `FormData`).
- `sessionStorage`: lightweight per-tab storage for UI convenience (not auth proof).
- `pageshow` event: used to re-check auth when the browser restores a page from the bfcache.

---

## `styles/`, `resources/`, `uploads/`

- `styles/` — CSS files for each page (e.g., `org-portal.css`, `osa-portal.css`, `admin-dashboard.css`). CSS contains styles and some utility classes referenced by HTML.
- `resources/` — fonts, icons, images.
- `uploads/` — destination for files uploaded via `api/submit.php`.

---

## `sql/312team-unbelibables.sql`

- SQL dump containing the schema and sample data for `simple_portal` database used by the PHP backend.
- Import this file in phpMyAdmin or via `mysql` CLI to create tables and seed data.

---

## Key technologies & patterns

- PHP sessions
  - `session_start()` is called in API scripts. PHP creates a session ID and stores it in a cookie. Server stores session data in `$_SESSION`.
  - Server-side session is authoritative: client-side `sessionStorage` is only for convenience.
  - `session_unset()` and `session_destroy()` are used on logout to clear session data.

- AJAX (fetch)
  - `fetch()` is used extensively for: login, logout, session checks, reading records, submitting forms, and admin API calls.
  - Successful responses are JSON and handled with `res.json()`.
  - For endpoints that set or rely on cookies, some fetches include `credentials: 'include'` (admin server routes) to ensure the browser sends the cookie.
  - File uploads use `FormData` (multipart/form-data) and do not set `Content-Type` so the browser adds the boundary.

- Back-button and caching
  - `Cache-Control: no-store` is added to sensitive responses to reduce caching risk.
  - Client code uses `location.replace(...)` on logout to replace history entries so the Back button cannot return to a protected view.
  - `pageshow` event is used to detect bfcache restores and revalidate session with the server.

---

## Security & improvement notes (short)

- Passwords: store and verify hashed passwords (bcrypt / password_hash) instead of plain text comparison.
- Input validation/sanitization: ensure all inputs are validated and sanitized server-side.
- CSRF: consider CSRF protections for state-changing POST requests.
- Session cookie flags: set `HttpOnly`, `Secure` (when using HTTPS), and `SameSite` attributes for session cookies.
- Consolidate shared client helpers into a single `scripts/utils.js` if you plan to reduce duplication further.

---

If you want, I can:
- Produce a shorter per-file one-line summary for quick scanning.
- Generate a table-of-contents with file links.
- Add inline code-block references for important functions (e.g., the exact `login.php` flow).


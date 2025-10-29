# SLU OSA Portal - Login integration

This project now uses a simple PHP + MySQL backend for login instead of hardcoded credentials.

## What was added
- `api/db.php`: minimal database connection helper (WAMP defaults: user `root`, empty password).
- `api/login.php`: POST endpoint that authenticates Admin/OSA in `admin` table and Student Orgs in `client` table.
- `scripts/login.js`: updated to call the backend and set the same localStorage keys as before.
- `tableswithconstraints.sql`: now creates/uses database `slu_org_db` and seeds sample admin/osa/client users.

## Database setup
1. Open phpMyAdmin (http://localhost/phpmyadmin/) or use the MySQL client.
2. Import `tableswithconstraints.sql` into your MySQL server. It will:
   - Create database `slu_org_db` if it does not exist
   - Create the required tables
   - Insert sample users

Seeded accounts:
- Admin (redirects to Admin Dashboard):
  - admin@slu.edu.ph / admin123
  - admin2@slu.edu.ph / admin123
- OSA Staff (redirects to OSA Forms):
  - staff@slu.edu.ph / staff123
  - osa@slu.edu.ph / osa123
- Student Orgs (redirects to Org Dashboard):
  - samcis@slu.edu.ph / samcis123 (org: SAMCIS)
  - icon@slu.edu.ph / icon123 (org: ICON)
  - student@slu.edu.ph / student123 (org: Student Council)

Note: Passwords are stored in plaintext in the seed for simplicity. The backend supports hashed passwords via `password_verify()` automatically, so you can update a user's password to a bcrypt hash later without code changes.

## How to run (WAMP)
- Place this project under `c:\\wamp64\\www` (already done).
- Start WAMP and ensure Apache + MySQL services are running (green icon).
- Visit `http://localhost/` and open the portal login page (index.html).
- Log in using one of the seeded accounts.

## Endpoint contract
- POST `api/login.php`
  - Body: JSON `{ "email": string, "password": string }` (also supports form-encoded)
  - Response on success:
    ```json
    {
      "success": true,
      "role": "admin" | "osa" | "student",
      "name": "Display Name",
      "org": "Org Name (for students only)",
      "redirectPath": "../admin/admin-dashboard.html" | "../osa-staff/osa-forms.html" | "../org/org-dashboard.html"
    }
    ```
  - Response on error: HTTP 400/401/500 with `{ "success": false, "message": "..." }`

## Notes
- Frontend still uses `localStorage` keys: `isLoggedIn`, `userEmail`, `userRole`, `userName`, `userOrg` (when applicable) for compatibility with existing pages.
- If your MySQL credentials differ, update `api/db.php` accordingly.
- Everything is kept intentionally small and non-redundant: one connection helper and one login endpoint.

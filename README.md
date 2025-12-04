# Student Organization Portal

A basic web portal for managing student organization submissions with simple HTML/CSS/JS and minimal PHP database operations.

---

## Quick start

- Requirements: `WAMP` (or PHP + MySQL) and optionally `Node.js` + `npm` for the admin server.
- Import the database: open `http://localhost/phpmyadmin` and import `sql/312team-unbelibables.sql`.
- Edit database credentials in `api/db.php` to match your MySQL user/password.
- Start WAMP (Apache + MySQL) and open the app at `http://localhost/`.

Optional — start the local admin server (Node/Express):
```powershell
cd C:\wamp64\www\admin
npm install   # only if dependencies are missing
node server.js
# admin server: http://localhost:3001
```

Keep project files under `C:\wamp64\www\` so URLs and relative paths resolve.

---

## Features

- Basic submission forms and submission list display
- Simple PHP + MySQL CRUD endpoints for submissions and session checks
- Admin UI (optional) served by a small Node/Express server in `admin/`
- Basic session handling (server-side PHP sessions) and client-side routing

Security: this repository uses simple session handling intended for local/dev use. Harden before production.

---

## Authentication & session

- PHP endpoints use `$_SESSION` to track login state. Client scripts call `/api/login.php`, `/api/logout.php`, and `/api/logout.php` (GET) for session checks.
- Protected pages run a session check on load and on `pageshow` restoration; on logout the client uses `location.replace(...)` so the browser Back button won't return to protected pages.

---

## Database Schema

**Database**: `simple_portal`  
**Table**: `submissions`

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AI) | Unique identifier |
| org_name | VARCHAR(255) | Organization name |
| submission_title | VARCHAR(255) | Title of submission |
| applicant_name | VARCHAR(255) | Name of applicant |
| created_at | TIMESTAMP | Auto-generated timestamp |

---

## Key files & API endpoints

- `api/db.php` — database connection (update credentials here)
- `api/login.php` — login handler (POST expects JSON `{email,password}`)
- `api/logout.php` — logout handler and session check (POST to logout, GET to check session)
- `api/read.php` — read submissions (GET)
- `api/submit.php` — submit new form (POST, multipart/form-data for file uploads)
- `api/*.php` — other helper endpoints used by the UI

Client-side scripts that protect pages are under `scripts/` (`org-portal.js`, `osa-portal.js`, `admin/admin-portal.js`).

---

## Project layout (important files)

```
index.html
admin/
  ├─ admin-login.html
  ├─ admin-portal.html
  └─ server.js            # Node/Express admin server (optional)
api/
  ├─ db.php               # DB connection
  ├─ login.php
  ├─ logout.php
  ├─ read.php
  └─ submit.php
pages/
  ├─ org-portal.html
  └─ osa-portal.html
scripts/
  ├─ login.js
  ├─ org-portal.js
  ├─ osa-portal.js
  └─ admin/admin-portal.js
styles/
resources/
sql/
  └─ 312team-unbelibables.sql
```


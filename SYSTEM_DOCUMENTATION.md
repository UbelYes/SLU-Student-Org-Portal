# SLU Student Organization Portal - System Documentation

**Version:** 2.0  
**Last Updated:** November 2025  
**Team:** Unbelievables - 312 Database Management

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Structure](#database-structure)
4. [File Structure](#file-structure)
5. [API Endpoints](#api-endpoints)
6. [User Roles & Access](#user-roles--access)
7. [File Upload System](#file-upload-system)
8. [Security Features](#security-features)
9. [Setup & Configuration](#setup--configuration)

---

## System Overview

The SLU Student Organization Portal is a web-based management system for Saint Louis University's Office of Student Affairs (OSA) to manage student organizations, form submissions, and document uploads.

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: PHP 7.4+/8.x
- **Database**: MySQL 5.7+/9.1.0
- **Server**: WAMP (Windows, Apache, MySQL, PHP)
- **Authentication**: PHP Sessions
- **File Storage**: Server filesystem

### Key Features
- **Three user types**: Admin, OSA Staff, Organizations
- **Form submission system** with multiple events per submission
- **File upload capability** (PDF and images, max 10MB)
- **Document management page** for OSA staff
- **Real-time activity tracking** and online user monitoring
- **Status management**: Pending, Approved, Returned
- **OSA feedback system** for submission revisions
- **Mobile-responsive design** with hamburger navigation
- **Search, filter, and sort** functionality

---

## Architecture

```
┌─────────────────┐
│  Client Browser │
│  (HTML/CSS/JS)  │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  Apache Server  │
│   (WAMP)        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
┌────────┐ ┌──────────┐
│  PHP   │ │  Static  │
│  APIs  │ │  Files   │
└───┬────┘ └──────────┘
    │
    ↓
┌─────────────┐
│   MySQL     │
│  (slu_org_db)│
└─────────────┘
```

---

## Database Structure

### Database Name: `slu_org_db`

### Tables

#### 1. `admin`
Stores administrator and OSA staff accounts.

| Field | Type | Description |
|-------|------|-------------|
| adminid | INT (PK) | Primary key |
| username | VARCHAR(50) | Username |
| password | VARCHAR(255) | Password |
| email | VARCHAR(100) | Email (login identifier) |
| role | ENUM | `super_admin` or `osa_admin` |
| last_login | DATETIME | Last login timestamp |
| status | ENUM | `active` or `inactive` |
| created_at | DATETIME | Account creation |

**Default Accounts:**
- Admin: `admin@slu.edu.ph` / `admin123`
- OSA: `osa@slu.edu.ph` / `osa123`

#### 2. `client`
Stores student organization accounts.

| Field | Type | Description |
|-------|------|-------------|
| clientid | INT (PK) | Primary key |
| org_name | VARCHAR(100) | Organization name |
| username | VARCHAR(50) | Username |
| password | VARCHAR(255) | Password |
| email | VARCHAR(100) | Email (login identifier) |
| status | ENUM | `active` or `inactive` |
| last_login | DATETIME | Last login timestamp |
| created_at | DATETIME | Account creation |

**Default Account:**
- ICON: `icon@slu.edu.ph` / `icon123`

#### 3. `org_form_submissions`
Stores organization form submissions.

| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Primary key |
| clientid | INT (FK) | References client(clientid) |
| submission_title | VARCHAR(255) | Title of submission |
| org_full_name | VARCHAR(255) | Full organization name |
| org_acronym | VARCHAR(50) | Organization acronym |
| org_email | VARCHAR(100) | Organization email |
| social_media_links | TEXT | Social media URLs |
| applicant_name | VARCHAR(100) | Submitter name |
| applicant_position | VARCHAR(100) | Submitter position |
| applicant_email | VARCHAR(100) | Submitter email |
| adviser_names | TEXT | Adviser names |
| adviser_emails | TEXT | Adviser emails |
| category | VARCHAR(255) | Categories (comma-separated) |
| org_type | ENUM | `academic`, `non_academic`, `publication` |
| cbl_status | ENUM | `CBL` or `NON-CBL` |
| **attachment_path** | VARCHAR(255) | Path to uploaded file |
| status | ENUM | `pending`, `approved`, `returned` |
| osa_feedback | TEXT | OSA comments |
| submitted_date | DATETIME | Submission timestamp |
| reviewed_date | DATETIME | Review timestamp |

#### 4. `org_events`
Stores events associated with submissions.

| Field | Type | Description |
|-------|------|-------------|
| event_id | INT (PK) | Primary key |
| submission_id | INT (FK) | References org_form_submissions(id) |
| event_name | VARCHAR(255) | Event name |
| event_date | DATE | Event date |
| event_venue | VARCHAR(255) | Event location |
| event_description | TEXT | Event details |
| event_participants | INT | Number of participants |
| event_budget | DECIMAL(10,2) | Budget amount |

#### 5. `login_activity`
Tracks user login activity.

| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Primary key |
| user_type | ENUM | `admin` or `client` |
| user_id | INT | User ID |
| username | VARCHAR(100) | Username |
| org_name | VARCHAR(100) | Organization name (if client) |
| login_time | DATETIME | Login timestamp |
| logout_time | DATETIME | Logout timestamp |
| is_online | BOOLEAN | Current online status |

---

## File Structure

```
c:\wamp64\www\
├── index.html                      # Login page
├── README.md                       # Quick start guide
├── SYSTEM_DOCUMENTATION.md         # This file
│
├── admin/
│   └── admin-dashboard.html        # Admin dashboard
│
├── org/
│   ├── org-form.html              # Submission form with file upload
│   └── org-submissions.html       # Submission history
│
├── osa-staff/
│   ├── osa-forms.html             # Review submissions
│   └── osa-documents.html         # Document management
│
├── api/
│   ├── db.php                     # Database connection
│   ├── login.php                  # Authentication
│   ├── submit-form.php            # Handle submissions + file upload
│   ├── get-submissions.php        # Retrieve submissions
│   ├── get-documents.php          # Retrieve documents list
│   ├── update-submission-status.php  # Update status/feedback
│   ├── get-online-users.php       # Get active users
│   └── update-activity.php        # Update user status
│
├── scripts/
│   ├── login.js                   # Login logic
│   ├── main_page.js              # Session management
│   ├── admin-scripts/
│   │   ├── admin-dashboard.js
│   │   ├── activity-tracker.js
│   │   └── admin-navbar.js
│   ├── org-scripts/
│   │   ├── org-form.js           # Form submission (FormData)
│   │   ├── org-submissions.js
│   │   ├── org-navbar.js
│   │   └── hamburger-menu.js
│   └── osa-scripts/
│       ├── osa-forms.js          # Review functionality
│       ├── osa-documents.js      # Document management
│       └── osa-navbar.js
│
├── styles/
│   ├── fonts.css
│   ├── login-style.css
│   ├── admin-styles/
│   │   └── admin-dashboard.css
│   ├── org-styles/
│   │   ├── org-forms.css
│   │   └── org-submissions.css
│   └── osa-styles/
│       ├── osa-forms.css
│       ├── osa-documents.css
│       └── osa-navbar.css
│
├── resources/
│   ├── icons/                    # SVG icons
│   │   ├── view-icon.svg
│   │   ├── download-icon-white.svg
│   │   ├── document-icon.svg
│   │   └── ...
│   ├── images/                   # SLU logo, etc.
│   └── fonts/                    # Custom fonts
│
├── uploads/                      # Uploaded files (PDF, images)
│   └── submission_*.{pdf,jpg,png}
│
└── sql/
    └── slu_org_db.sql           # Database schema + sample data
```

---

## API Endpoints

### Authentication
**POST** `/api/login.php`
- **Input**: `{ "email": "user@slu.edu.ph", "password": "pass123" }`
- **Output**: `{ "success": true, "role": "admin", "redirect": "/admin/admin-dashboard.html" }`
- Creates PHP session with `adminid`/`clientid` and `role`

### Form Submission
**POST** `/api/submit-form.php`
- **Content-Type**: `multipart/form-data`
- **Input**: Form fields + optional `attachment` file
- **Validates**: File type (pdf, jpg, png), size (max 10MB)
- **Output**: `{ "success": true, "submission_id": 123 }`

### Get Submissions
**GET** `/api/get-submissions.php?clientid=<id>`
- **Output**: Array of submissions with events, status, feedback, attachment_path

### Get Documents
**GET** `/api/get-documents.php?search=<term>&sort=<option>`
- **Output**: Array of submissions with attachments and metadata
- **Used by**: OSA Documents page

### Update Status
**POST** `/api/update-submission-status.php`
- **Input**: `{ "id": 123, "status": "approved", "feedback": "Good job!" }`
- **Output**: `{ "success": true }`

### Activity Tracking
**GET** `/api/get-online-users.php`
- Returns list of currently online users

**POST** `/api/update-activity.php`
- Updates user online status

---

## User Roles & Access

### Admin (super_admin)
- **Access**: Admin dashboard
- **Capabilities**:
  - View all online users
  - Monitor login activity
  - View system statistics
  - Cannot review submissions

### OSA Staff (osa_admin)
- **Access**: OSA forms and documents pages
- **Capabilities**:
  - Review organization submissions
  - Approve or return with feedback
  - View submission details and attachments
  - Browse/download all uploaded documents
  - Search, filter, and sort submissions

### Organizations (client)
- **Access**: Organization form and submissions pages
- **Capabilities**:
  - Submit end-term requirement forms
  - Add multiple events per submission
  - Upload supporting documents (PDF, images)
  - View submission history
  - Track status (Pending/Approved/Returned)
  - Read OSA feedback

---

## File Upload System

### Supported File Types
- **PDF** (`.pdf`)
- **Images** (`.jpg`, `.jpeg`, `.png`)

### File Size Limit
- Maximum: **10MB** per file

### Upload Flow
1. User selects file in org-form.html
2. JavaScript creates FormData with file + form fields
3. Sent to `/api/submit-form.php` as multipart/form-data
4. PHP validates:
   - File extension (whitelist check)
   - File size (< 10MB)
   - PDF signature (magic bytes: `%PDF`)
5. File moved to `uploads/` with unique name
6. Path stored in `attachment_path` field
7. Transaction committed or rolled back on error

### File Storage
- **Location**: `c:\wamp64\www\uploads\`
- **Naming**: `submission_<uniqueid>.<ext>`
- **Example**: `submission_672a3b4c5d6e7.pdf`

### Viewing/Downloading
- **Organizations**: View attachment link in submission history modal
- **OSA Staff**: 
  - View in submission review modal
  - Browse all files in dedicated Documents page
  - Download files with original context (org, submission title, date)

### Security
- Extension whitelist (only pdf, jpg, jpeg, png)
- Size limit enforced
- File signature validation for PDFs
- Unique filenames prevent overwrites
- Server-side validation (cannot be bypassed)

---

## Security Features

### Authentication
- Session-based (PHP `$_SESSION`)
- Role-based access control
- Session IDs regenerated on login
- Logout clears session data

### File Upload Security
- Extension whitelist only
- PDF magic bytes verification (`%PDF`)
- File size limit (10MB)
- Unique filenames (timestamp-based)
- Server-side validation (no client-side bypass)

### Database Security
- Prepared statements (MySQLi)
- Parameter binding prevents SQL injection
- Foreign key constraints for data integrity
- Transactions for atomic operations

### Input Validation
- Required field validation
- Email format validation
- SQL injection prevention via prepared statements
- XSS prevention via escapeHtml() in JavaScript

---

## Setup & Configuration

### System Requirements
- Windows 10/11
- WAMP Server 3.0+ (Apache 2.4+, PHP 7.4+, MySQL 5.7+)
- Minimum 100MB disk space
- PHP extensions: mysqli, fileinfo, mbstring

### Installation Steps

1. **Install WAMP Server**
   - Download from https://www.wampserver.com/en/
   - Install and wait for green icon in system tray

2. **Deploy Files**
   - Place project files in `c:\wamp64\www\`
   - Ensure path: `c:\wamp64\www\index.html`

3. **Create Uploads Directory**
   ```powershell
   New-Item -Path "c:\wamp64\www\uploads" -ItemType Directory
   ```

4. **Import Database**
   - Open `http://localhost/phpmyadmin`
   - Click **Import**
   - Choose file: `sql/slu_org_db.sql`
   - Click **Go**

5. **Configure PHP** (if needed)
   Edit `c:\wamp64\bin\apache\apache2.x.x\bin\php.ini`:
   ```ini
   file_uploads = On
   upload_max_filesize = 10M
   post_max_size = 12M
   max_execution_time = 30
   ```

6. **Test Installation**
   - Navigate to `http://localhost/`
   - Login with test credentials
   - Try uploading a PDF file

### Database Configuration
File: `api/db.php`
```php
$servername = "localhost";
$username = "root";
$password = "";  // Default WAMP has no password
$dbname = "slu_org_db";
```

---

## Troubleshooting

### WAMP Not Green
- Stop apps using port 80 (Skype, IIS, etc.)
- Install Visual C++ Redistributable packages
- Check Windows services (Apache, MySQL)

### File Upload Fails
- Verify `uploads/` directory exists
- Check write permissions on uploads folder
- Confirm PHP `upload_max_filesize` setting
- Check PHP error log: `c:\wamp64\logs\php_error.log`

### Database Connection Error
- Ensure WAMP is running (green icon)
- Verify MySQL service is started
- Check database name: `slu_org_db`
- Confirm credentials in `api/db.php`

### Session Issues
- Clear browser cookies
- Check PHP session settings
- Verify session path is writable

### PDF Upload Rejected
- Ensure file is valid PDF (starts with `%PDF`)
- Check file size < 10MB
- Verify extension is `.pdf` (lowercase)
- Try different PDF file

---

## Recent Updates (November 2025)

- ✅ File upload system implemented (PDF and images only)
- ✅ OSA Documents page for viewing/downloading all files
- ✅ Mobile responsive design with hamburger navigation
- ✅ Enhanced file validation (extension + magic bytes)
- ✅ Removed Google sign-in (session-based auth only)
- ✅ Database schema updated with `attachment_path` field
- ✅ Comprehensive error logging for debugging
- ✅ Icon-based UI (replaced emojis with SVG icons)

---

## Support

**Team Unbelievables - 312 Database Management**  
**Saint Louis University - Office of Student Affairs**

For technical support, check:
- PHP error logs in `c:\wamp64\logs\`
- Browser console (F12 → Console)
- Database connection status
- File permissions on `uploads/` directory

---

**End of Documentation**

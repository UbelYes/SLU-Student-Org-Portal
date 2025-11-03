# SLU Student Organization Portal - Complete System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Structure](#database-structure)
4. [File Structure & Functionality](#file-structure--functionality)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [User Roles & Access](#user-roles--access)
8. [Data Flow](#data-flow)
9. [Security Features](#security-features)
10. [Setup & Configuration](#setup--configuration)

---

## System Overview

The SLU Student Organization Portal is a web-based management system for Saint Louis University's Office of Student Affairs (OSA) to manage student organizations, forms, and submissions. The system is built using:

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP 8.3.14
- **Database**: MySQL 9.1.0
- **Server**: WAMP (Windows, Apache, MySQL, PHP)

### Key Features
- User authentication for three user types (Admin, OSA Staff, Organizations)
- Form submission system with event details
- Document management (placeholder for future implementation)
- Real-time activity tracking
- User dashboard for monitoring online users
- Submission status management (Pending, Approved, Returned)

---

## Architecture

### System Architecture
```
┌─────────────────┐
│  Client Browser │
└────────┬────────┘
         │ HTTP/HTTPS
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
│  Database   │
└─────────────┘
```

### Technology Stack
- **Web Server**: Apache (via WAMP)
- **Backend Language**: PHP 8.3.14
- **Database**: MySQL 9.1.0
- **Session Management**: PHP Sessions + localStorage
- **API Communication**: Fetch API (AJAX)
- **Authentication**: Email/Password + OAuth placeholder

---

## Database Structure

### Database Name: `slu_org_db`

### Tables

#### 1. `admin` Table
Stores administrator and OSA staff accounts.

```sql
CREATE TABLE admin (
  adminid INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('super_admin', 'osa_admin') DEFAULT 'osa_admin',
  last_login DATETIME NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Fields:**
- `adminid`: Primary key
- `username`: Admin username
- `password`: Plaintext or hashed password (flexible verification)
- `email`: Email address (unique identifier for login)
- `role`: User role (super_admin or osa_admin)
- `last_login`: Timestamp of last login (used for activity tracking)
- `status`: Account status (active/inactive)
- `created_at`: Account creation timestamp

**Default Users:**
- Admin: `admin@slu.edu.ph` / `admin123`
- OSA: `osa@slu.edu.ph` / `osa123`

#### 2. `client` Table
Stores student organization accounts.

```sql
CREATE TABLE client (
  clientid INT AUTO_INCREMENT PRIMARY KEY,
  org_name VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  last_login DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Fields:**
- `clientid`: Primary key
- `org_name`: Full organization name
- `username`: Login username
- `password`: Plaintext or hashed password
- `email`: Organization email (unique identifier)
- `status`: Account status
- `last_login`: Activity tracking timestamp
- `created_at`: Account creation timestamp

**Default Organization:**
- ICON: `icon@slu.edu.ph` / `icon123`

#### 3. `org_form_submissions` Table
Stores organization form submissions with comprehensive details.

```sql
CREATE TABLE org_form_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clientid INT NOT NULL,
  submission_title VARCHAR(255) NOT NULL,
  org_full_name VARCHAR(255) NOT NULL,
  org_acronym VARCHAR(50) NOT NULL,
  org_email VARCHAR(100) NOT NULL,
  social_media_links TEXT,
  applicant_name VARCHAR(150) NOT NULL,
  applicant_position VARCHAR(100) NOT NULL,
  applicant_email VARCHAR(100) NOT NULL,
  adviser_names TEXT NOT NULL,
  adviser_emails TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  org_type ENUM('co-curricular', 'extra-curricular', 'publication'),
  cbl_status ENUM('with-revisions', 'without-revisions'),
  video_link VARCHAR(500) NOT NULL,
  status ENUM('Pending', 'Approved', 'Returned') DEFAULT 'Pending',
  submitted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (clientid) REFERENCES client(clientid) ON DELETE CASCADE
)
```

**Fields:**
- `id`: Primary key
- `clientid`: Foreign key to client table
- `submission_title`: Descriptive title for the submission
- Organization details: name, acronym, email, social media
- Applicant details: name, position, email
- Adviser information: names and emails (comma-separated)
- `category`: Schools/departments (comma-separated: SAMCIS, SEA, SOM, etc.)
- `org_type`: Organization classification
- `cbl_status`: CBL document revision status
- `video_link`: YouTube/video URL for organization presentation
- `status`: Submission status (Pending/Approved/Returned)
- Timestamps: submitted_date, updated_date

#### 4. `org_events` Table
Stores event details associated with form submissions.

```sql
CREATE TABLE org_events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_venue VARCHAR(255) NOT NULL,
  event_description TEXT NOT NULL,
  expected_participants INT NOT NULL,
  budget_estimate DECIMAL(10,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES org_form_submissions(id) ON DELETE CASCADE
)
```

**Fields:**
- `event_id`: Primary key
- `submission_id`: Foreign key to org_form_submissions
- `event_name`: Name of the event
- `event_date`: Scheduled date
- `event_venue`: Location
- `event_description`: Detailed description
- `expected_participants`: Number of expected attendees
- `budget_estimate`: Estimated budget in PHP
- `created_at`: Record creation timestamp

#### 5. `login_activity` Table
Tracks user login sessions and activity duration.

```sql
CREATE TABLE login_activity (
  activityid INT AUTO_INCREMENT PRIMARY KEY,
  userid INT NOT NULL,
  user_type ENUM('admin', 'client') NOT NULL,
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  logout_time DATETIME NULL,
  duration INT NULL COMMENT 'Duration in minutes',
  auto_logout_flag TINYINT(1) DEFAULT 0
)
```

**Fields:**
- `activityid`: Primary key
- `userid`: User ID (adminid or clientid)
- `user_type`: Type of user (admin or client)
- `login_time`: Login timestamp
- `logout_time`: Logout timestamp
- `duration`: Session duration in minutes
- `auto_logout_flag`: Whether session was auto-logged out

---

## File Structure & Functionality

### Root Directory

#### `index.html`
**Purpose**: Main login page for the portal.

**Features:**
- Email and password input fields
- Form validation
- Redirects to appropriate dashboard based on user role
- Google OAuth button (placeholder for future implementation)
- Error message display

**Connected Files:**
- CSS: `/styles/login-style.css`
- JS: `/scripts/login.js`

#### `README.md`
**Purpose**: Installation and setup instructions.

**Contents:**
- Prerequisites (WAMP server)
- Installation steps
- Database setup instructions
- Configuration guide
- Troubleshooting tips

---

### `/admin/` Directory

#### `admin-dashboard.html`
**Purpose**: Admin dashboard for monitoring online users and system activity.

**Features:**
- Real-time user activity monitoring
- Three tabs: Online Users, All Organizations, OSA Staff
- Quick statistics (online orgs, online staff, total users)
- Search and filter capabilities
- Auto-refresh every 30 seconds
- Activity status indicators

**Connected Files:**
- CSS: `/styles/admin-styles/admin-dashboard.css`
- JS: `/scripts/admin-scripts/admin-dashboard.js`, `/scripts/admin-scripts/activity-tracker.js`

---

### `/org/` Directory

#### `org-form.html`
**Purpose**: Form submission interface for student organizations.

**Features:**
- Multi-section form with validation
- Organization information input
- Applicant details
- Adviser information
- Category selection (checkboxes for schools)
- Organization type selection (radio buttons)
- CBL status selection
- Dynamic event addition (multiple events)
- Video link input
- File attachment placeholder
- Form validation before submission

**Sections:**
1. Submission Title
2. Organization Information
3. Applicant Information
4. Adviser Information
5. Categories
6. Organization Type
7. Additional Information
8. Events (dynamic)

**Connected Files:**
- CSS: `/styles/org-styles/org-forms.css`
- JS: `/scripts/org-scripts/org-form.js`, `/scripts/org-scripts/org-navbar.js`

#### `org-submissions.html`
**Purpose**: View and manage organization's submitted forms.

**Features:**
- List of all submissions by the organization
- Status badges (Pending, Approved, Returned)
- Search functionality
- Status filter
- Sort by date/title
- Pagination
- View submission details in modal
- Submission metadata display

**Connected Files:**
- CSS: `/styles/org-styles/org-submissions.css`
- JS: `/scripts/org-scripts/org-submissions.js`

---

### `/osa-staff/` Directory

#### `osa-forms.html`
**Purpose**: OSA staff interface to view and manage all form submissions.

**Features:**
- View all submissions from all organizations
- Search across all fields
- Sort by multiple criteria
- Detailed view modal
- Status management (Approve/Return)
- Event details display
- Pagination
- Export/download functionality

**Connected Files:**
- CSS: `/styles/osa-styles/osa-forms.css`
- JS: `/scripts/osa-scripts/osa-forms.js`

#### `osa-documents.html`
**Purpose**: Document management interface (placeholder).

**Features:**
- Document listing (future feature)
- File upload interface (placeholder)
- Document search and filter
- Download functionality (planned)

**Note**: File upload feature is planned for future implementation.

**Connected Files:**
- CSS: `/styles/osa-styles/osa-documents.css`
- JS: `/scripts/osa-scripts/osa-documents.js`

---

### `/api/` Directory

All API files return JSON responses and use PHP sessions for authentication.

#### `db.php`
**Purpose**: Database connection manager.

**Functionality:**
- Establishes MySQL connection
- Configuration variables for database credentials
- Error handling with JSON response
- UTF-8 charset configuration

**Configuration:**
```php
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'slu_org_db';
```

#### `login.php`
**Purpose**: User authentication endpoint.

**Method**: POST

**Input** (JSON or form-encoded):
- `email`: User email
- `password`: User password

**Process:**
1. Validates input fields
2. Checks admin table first
3. Checks client table if admin not found
4. Verifies password (supports both plaintext and hashed)
5. Updates last_login timestamp
6. Creates PHP session
7. Returns user info and redirect path

**Response** (Success):
```json
{
  "success": true,
  "role": "admin|osa|student",
  "userId": 1,
  "name": "Username",
  "org": "Organization Name",
  "redirectPath": "/path/to/dashboard"
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Error message"
}
```

**Session Variables Set:**
- `user_type`: 'admin' or 'client'
- `adminid` or `clientid`: User ID
- `role`: User role
- `email`: User email
- `username`: Username
- `org_name`: Organization name (clients only)

#### `submit-form.php`
**Purpose**: Handle organization form submissions.

**Method**: POST

**Authentication**: Requires active client session

**Input** (JSON):
```json
{
  "submission_title": "string",
  "org_full_name": "string",
  "org_acronym": "string",
  "org_email": "string",
  "social_media_links": "string",
  "applicant_name": "string",
  "applicant_position": "string",
  "applicant_email": "string",
  "adviser_names": "string",
  "adviser_emails": "string",
  "category": "string",
  "org_type": "co-curricular|extra-curricular|publication",
  "cbl_status": "with-revisions|without-revisions",
  "video_link": "string",
  "events": [
    {
      "name": "string",
      "date": "YYYY-MM-DD",
      "venue": "string",
      "description": "string",
      "participants": number,
      "budget": number
    }
  ]
}
```

**Process:**
1. Validates session authentication
2. Validates all required fields
3. Validates events array (at least one event required)
4. Starts database transaction
5. Inserts submission into org_form_submissions
6. Inserts all events into org_events
7. Commits transaction
8. Returns submission ID

**Response** (Success):
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "submission_id": 123,
  "events_added": 3
}
```

#### `get-submissions.php`
**Purpose**: Retrieve form submissions with event details.

**Method**: GET

**Authentication**: Requires admin or client session

**Access Control:**
- Organizations: See only their own submissions
- OSA Staff: See all submissions

**Process:**
1. Checks authentication
2. Builds SQL query based on user type
3. Retrieves submissions from database
4. For each submission, retrieves associated events
5. Returns combined data

**Response**:
```json
{
  "success": true,
  "submissions": [
    {
      "id": 1,
      "submission_title": "string",
      "org_full_name": "string",
      "org_acronym": "string",
      "status": "Pending|Approved|Returned",
      "submitted_date": "YYYY-MM-DD HH:MM:SS",
      "events": [
        {
          "event_id": 1,
          "event_name": "string",
          "event_date": "YYYY-MM-DD",
          "event_venue": "string",
          "event_description": "string",
          "expected_participants": 50,
          "budget_estimate": "5000.00"
        }
      ],
      "event_count": 3
    }
  ],
  "total": 10
}
```

#### `update-submission-status.php`
**Purpose**: Update submission status (Approve/Return).

**Method**: POST

**Authentication**: Requires admin session

**Input** (JSON):
```json
{
  "submission_id": 123,
  "status": "Approved|Returned|Pending",
  "notes": "Optional feedback"
}
```

**Process:**
1. Validates admin authentication
2. Validates input (submission_id and status required)
3. Updates submission status in database
4. Updates updated_date timestamp
5. Returns confirmation

**Response**:
```json
{
  "success": true,
  "message": "Submission status updated successfully",
  "submission_id": 123,
  "new_status": "Approved"
}
```

#### `update-activity.php`
**Purpose**: Update user's last_login timestamp for activity tracking.

**Method**: POST

**Authentication**: Requires active session (admin or client)

**Process:**
1. Checks session authentication
2. Updates last_login to NOW() in appropriate table
3. Returns success with timestamp

**Called By:**
- Activity tracker (every 2 minutes)
- User interactions (throttled to 30 seconds)
- Before page unload

**Response**:
```json
{
  "success": true,
  "message": "Activity updated",
  "user_type": "admin|client",
  "timestamp": "2025-11-03 12:00:00"
}
```

#### `get-online-users.php`
**Purpose**: Retrieve currently online users and system statistics.

**Method**: GET

**Authentication**: Requires admin session

**Online Threshold**: 5 minutes (users active within last 5 minutes)

**Process:**
1. Validates admin authentication
2. Queries organizations with last_login within 5 minutes
3. Queries OSA staff with last_login within 5 minutes
4. Retrieves all organizations with online status
5. Retrieves all OSA staff with online status
6. Calculates statistics

**Response**:
```json
{
  "success": true,
  "online_users": [
    {
      "id": 1,
      "type": "Organization|OSA Staff",
      "name": "string",
      "email": "string",
      "last_activity": "YYYY-MM-DD HH:MM:SS",
      "minutes_ago": 2,
      "status": "online"
    }
  ],
  "organizations": [...],
  "osa_staff": [...],
  "stats": {
    "online_orgs": 5,
    "online_staff": 2,
    "total_orgs": 15,
    "total_staff": 3,
    "total_users": 18
  }
}
```

#### `get-documents.php`
**Purpose**: Retrieve document attachments (placeholder).

**Method**: GET

**Authentication**: Requires admin session

**Status**: Feature not yet implemented

**Response**:
```json
{
  "success": true,
  "documents": [],
  "count": 0,
  "message": "File upload feature coming soon"
}
```

---

### `/scripts/` Directory

#### `login.js`
**Purpose**: Handle login form submission and logout functionality.

**Functions:**

**`handleLogin(event)`**
- Prevents default form submission
- Collects email and password
- Sends POST request to `/api/login.php`
- Stores user data in localStorage:
  - `isLoggedIn`: "true"
  - `userEmail`: email
  - `userRole`: role (admin/osa/student)
  - `userName`: username
  - `userOrg`: organization name (if client)
- Redirects to appropriate dashboard
- Displays error messages on failure

**`handleLogout()`**
- Clears all localStorage data
- Redirects to login page
- Handles relative path based on current location

#### `auth.js`
**Purpose**: Google OAuth authentication (placeholder).

**Status**: Not fully implemented, prepared for future OAuth integration

**Configuration:**
- CLIENT_ID: Google OAuth client ID
- REDIRECT_URI: Callback URL
- HOSTED_DOMAIN: SLU domain restriction

**Functions:**
- `getGoogleOAuthURL()`: Generates OAuth URL
- `handleGoogleLogin()`: Initiates OAuth flow
- `processAuthCode()`: Exchanges code for token
- `AuthStorage`: Token management utility

#### `main_page.js`
**Purpose**: Navigation button state management.

**Functionality:**
- Handles active/inactive states for navigation items
- Adds click listeners to all `.nav-item` elements
- Toggles `active-btn` and `inactive-btn` classes

---

### `/scripts/admin-scripts/` Directory

#### `admin-dashboard.js`
**Purpose**: Admin dashboard functionality and real-time monitoring.

**Key Variables:**
- `organizations[]`: All organizations data
- `osaStaff[]`: All OSA staff data
- `onlineUsers[]`: Currently online users
- `stats{}`: System statistics

**Functions:**

**`initializeDashboard()`**
- Loads data from server
- Displays initial data
- Updates statistics

**`loadDataFromServer()`**
- Fetches data from `/api/get-online-users.php`
- Updates global arrays
- Error handling with user notification

**`displayOnlineData()`**
- Filters online users by search term
- Renders table with user information
- Shows user type, name, email, last activity
- Updates online count badge

**`displayOrgData()`**
- Displays all organizations
- Shows online/offline status
- Applies search and status filters
- Updates organization count

**`displayStaffData()`**
- Displays all OSA staff
- Shows online/offline status
- Applies search and status filters
- Updates staff count

**`switchTab(tabName)`**
- Handles tab switching
- Updates active tab styles
- Shows corresponding content

**`refreshData()`**
- Manual refresh button handler
- Reloads data from server
- Shows visual feedback

**`startAutoRefresh()`**
- Sets interval for automatic refresh (30 seconds)
- Updates dashboard without page reload

**`formatDateTime(dateString)`**
- Formats timestamps as relative time
- "X seconds/minutes/hours ago"
- Falls back to formatted date for older entries

#### `activity-tracker.js`
**Purpose**: Track user activity and keep session alive.

**ActivityTracker Object:**

**`init()`**
- Initializes activity tracking
- Starts periodic updates

**`trackPageView()`**
- Updates activity on page load

**`updateLastActivity()`**
- Sends POST to `/api/update-activity.php`
- Updates last_login timestamp
- Keeps user marked as "online"

**`startActivityTracking()`**
- Updates activity every 2 minutes
- Throttled interaction tracking (30 seconds)
- Tracks clicks, keypress, scroll, mousemove
- Uses sendBeacon on page unload for reliability

**Auto-initialization:**
- Automatically starts when DOM is ready
- Included in all authenticated pages

---

### `/scripts/org-scripts/` Directory

#### `org-form.js`
**Purpose**: Handle organization form submission.

**Global Variables:**
- `eventCounter`: Tracks number of events added

**Functions:**

**`submitForm(event)`**
- Validates all form fields
- Collects form data into JSON object
- Validates category selection (at least one)
- Validates events array (at least one event)
- Sends POST request to `/api/submit-form.php`
- Shows success/error messages
- Redirects to submissions page on success

**`getSelectedCategories()`**
- Collects all checked category checkboxes
- Returns comma-separated string

**`getEventDetails()`**
- Iterates through all `.event-entry` elements
- Collects event data for each entry
- Returns array of event objects

**`addEvent()`**
- Dynamically adds new event form section
- Increments event counter
- Creates HTML for new event fields
- Inserts into events container

**`removeEvent(button)`**
- Removes event entry from form
- Prevents removing last event
- Confirms before deletion
- Updates event titles

**`updateEventTitles()`**
- Renumbers event titles after removal
- Maintains sequential numbering

**`clearForm()`**
- Clears all form fields
- Confirms before clearing
- Resets to single event
- Clears file inputs

#### `org-submissions.js`
**Purpose**: Display and manage organization's submissions.

**Global Variables:**
- `allSubmissions[]`: All submission data
- `filteredSubmissions[]`: Filtered/sorted submissions
- `currentPage`: Current pagination page
- `itemsPerPage`: Items per page (10)

**Functions:**

**`loadSubmissions()`**
- Fetches submissions from `/api/get-submissions.php`
- Populates allSubmissions array
- Displays initial data

**`displaySubmissions(submissions)`**
- Renders submission table with pagination
- Shows title, acronym, date, status
- Creates view buttons
- Handles empty state

**`filterSubmissions()`**
- Filters by search term (title, acronym, org name)
- Filters by status
- Resets to first page
- Applies sorting

**`sortSubmissions()`**
- Sorts by date (newest/oldest)
- Sorts by title (A-Z/Z-A)
- Updates display

**`viewSubmission(id)`**
- Opens modal with submission details
- Displays all form fields
- Shows event information
- Updates status badge

**`updatePaginationInfo()`**
- Shows "Showing X-Y of Z records"
- Updates pagination controls

**Pagination Functions:**
- `goToPage(pageNum)`: Navigate to specific page
- `createPageButton(pageNum)`: Generate page number button
- `createEllipsis()`: Generate ellipsis for pagination

**Helper Functions:**
- `formatDate()`: Format date strings
- `capitalizeFirst()`: Capitalize status text
- `escapeHtml()`: Prevent XSS attacks

#### `org-navbar.js`
**Purpose**: Organization sidebar navigation.

**Functionality:**
- Loads username and organization name from localStorage
- Updates sidebar user profile
- Handles navigation between pages
- Manages active navigation states

---

### `/scripts/osa-scripts/` Directory

#### `osa-forms.js`
**Purpose**: OSA staff forms management interface.

**Global Variables:**
- `tableData[]`: All submission data
- `formsFilteredData[]`: Filtered data
- `formsCurrentPage`: Current page
- `formsItemsPerPage`: Items per page (10)
- `currentSort{}`: Current sort configuration

**Functions:**

**`loadSubmissions()`**
- Fetches all submissions from API
- Transforms data for table display
- Stores full submission in rawData property

**`openViewModal(submissionId)`**
- Finds submission by ID
- Populates modal with all fields
- Generates events HTML
- Displays modal

**`closeViewModal()`**
- Hides view modal

**`filterAndSortTable()`**
- Combines search filtering and sorting
- Filters by search term across all fields
- Applies sort order
- Updates display

**`handleHeaderClick(columnIndex)`**
- Toggles sort direction on header click
- Updates sort indicators (↑↓)
- Re-sorts table data

**`updateTableDisplay(data)`**
- Renders table with pagination
- Creates action buttons (View, Download)
- Shows status badges
- Handles empty results

**`generateEventsHTML(events)`**
- Creates formatted HTML for events
- Shows event cards with details
- Formats dates and budget

**Status Management Functions:**
- `approveSubmission(submissionId)`: Approve a submission
- `returnSubmission(submissionId)`: Return for revision
- Calls `/api/update-submission-status.php`

#### `osa-documents.js`
**Purpose**: Document management interface (placeholder).

**Status**: Feature not fully implemented

**Functions:**
- `loadDocuments()`: Load documents from API
- `displayDocuments()`: Render document table
- `viewDocument(index)`: Open document
- `downloadDocument(index)`: Download document
- `handleSearch()`: Filter documents
- `handleSort()`: Sort documents

**Pagination:**
- Similar structure to forms pagination
- Items per page: 10
- Page navigation controls

**Note**: Currently returns placeholder data as file upload is not implemented.

#### `osa-navbar.js`
**Purpose**: OSA staff navigation menu.

**Functionality:**
- Hamburger menu for mobile
- Navigation between Forms and Documents
- Highlights active page
- Logout button
- Responsive sidebar

---

### `/sql/` Directory

#### `slu_org_db.sql`
**Purpose**: Database schema and initial data.

**Contents:**
1. Database creation: `slu_org_db`
2. Table structures with constraints
3. Foreign key relationships
4. Default user accounts (admin, osa, icon)
5. Indexes for performance

**Key Features:**
- UTF-8 character encoding
- CASCADE delete for referential integrity
- AUTO_INCREMENT primary keys
- ENUM fields for controlled values
- Timestamp tracking (created_at, updated_at)

---

### `/styles/` Directory

#### Style Organization
- `fonts.css`: Custom font definitions
- `login-style.css`: Login page styles
- `/admin-styles/`: Admin dashboard styles
- `/org-styles/`: Organization interface styles
- `/osa-styles/`: OSA staff interface styles

**Common Design Elements:**
- Poppins and Arimo font families
- SLU brand colors
- Responsive layouts
- Card-based design
- Status badges with color coding
- Modal dialogs
- Pagination controls
- Search bars and filters

---

## User Roles & Access

### 1. Admin (Super Admin)
**Access Level**: Full system access

**Login**: `admin@slu.edu.ph` / `admin123`

**Pages**:
- `/admin/admin-dashboard.html` - User activity monitoring

**Capabilities**:
- Monitor all online users (organizations and OSA staff)
- View all organizations and their status
- View all OSA staff and their status
- Real-time activity tracking
- System statistics overview

### 2. OSA Staff (osa_admin)
**Access Level**: Full management access

**Login**: `osa@slu.edu.ph` / `osa123`

**Pages**:
- `/osa-staff/osa-forms.html` - Forms management
- `/osa-staff/osa-documents.html` - Document management

**Capabilities**:
- View all form submissions from all organizations
- Approve or return submissions
- View submission details and events
- Document management (planned)

### 3. Student Organization (Client)
**Access Level**: Organization-specific access

**Login**: `icon@slu.edu.ph` / `icon123` (example)

**Pages**:
- `/org/org-form.html` - Submit forms
- `/org/org-submissions.html` - View own submissions

**Capabilities**:
- Submit end-term forms with event details
- View own submission history
- Check submission status
- Edit draft submissions (if implemented)
- Upload documents (planned)

---

## Data Flow

### Login Process
```
1. User enters credentials → index.html
2. JavaScript collects data → login.js
3. POST request to api/login.php
4. PHP validates credentials against DB
5. PHP creates session
6. Response includes role and redirect path
7. JavaScript stores data in localStorage
8. User redirected to appropriate dashboard
```

### Form Submission Process
```
1. User fills form → org-form.html
2. JavaScript validates → org-form.js
3. Data collected into JSON object
4. POST request to api/submit-form.php
5. PHP validates session
6. PHP starts transaction
7. Insert into org_form_submissions
8. Insert events into org_events
9. Commit transaction
10. Return success with submission ID
11. Redirect to submissions page
```

### Activity Tracking
```
1. Page loads → activity-tracker.js initializes
2. Immediate activity update to API
3. Periodic updates every 2 minutes
4. User interactions trigger throttled updates
5. API updates last_login timestamp
6. Admin dashboard queries recent activity
7. Display users active within 5 minutes
```

### Status Update Process
```
1. OSA staff views submission
2. Clicks Approve/Return button
3. POST to api/update-submission-status.php
4. PHP validates admin session
5. Update status in database
6. Return confirmation
7. Update UI to show new status
```

---

## Security Features

### Authentication
1. **Session-based authentication**
   - PHP sessions for server-side state
   - Session validation on all API calls
   - Automatic session timeout

2. **Password handling**
   - Flexible password verification (plaintext/hashed)
   - Support for password_hash() and password_verify()
   - Prepared statements prevent SQL injection

3. **Access control**
   - Role-based access (admin, osa, student)
   - Organizations see only their own data
   - OSA staff see all data
   - API endpoints validate user type

### Data Protection
1. **SQL Injection Prevention**
   - Prepared statements with parameter binding
   - Input validation
   - Type checking

2. **XSS Prevention**
   - HTML escaping in JavaScript
   - Content-Type headers
   - Input sanitization

3. **CSRF Protection**
   - Session-based validation
   - Same-origin policy
   - Credential inclusion in API calls

### Database Security
1. **Foreign key constraints**
   - CASCADE delete maintains referential integrity
   - Prevents orphaned records

2. **ENUM validation**
   - Controlled values for status fields
   - Database-level validation

3. **Indexing**
   - Indexed fields for query performance
   - UNIQUE constraints on email/username

---

## Setup & Configuration

### Prerequisites
1. WAMP Server installed
2. Web browser (Chrome, Firefox, Edge)
3. Text editor (optional, for modifications)

### Installation Steps

1. **Install WAMP**
   - Download from https://www.wampserver.com/
   - Install and ensure icon is green (running)

2. **Deploy Files**
   - Place project folder in `c:\wamp64\www\`
   - Path should be: `c:\wamp64\www\[project-folder]\`

3. **Database Setup**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Click "Import" tab
   - Select `sql/slu_org_db.sql`
   - Click "Go" to import

4. **Configuration**
   - Edit `api/db.php` if needed:
     ```php
     $DB_HOST = 'localhost';
     $DB_USER = 'root';        // MySQL username
     $DB_PASS = '';            // MySQL password
     $DB_NAME = 'slu_org_db';
     ```

5. **Access the Portal**
   - Open browser
   - Navigate to: `http://localhost/[project-folder]/index.html`

### Default Accounts

**Admin:**
- Email: `admin@slu.edu.ph`
- Password: `admin123`

**OSA Staff:**
- Email: `osa@slu.edu.ph`
- Password: `osa123`

**Organization (ICON):**
- Email: `icon@slu.edu.ph`
- Password: `icon123`

### Troubleshooting

**Database Connection Error:**
- Verify WAMP is running (green icon)
- Check MySQL service is started
- Confirm database name is `slu_org_db`
- Verify credentials in `db.php`

**Page Not Found:**
- Check project is in correct WAMP directory
- Verify URL path matches folder name
- Ensure Apache is running

**WAMP Icon Orange/Yellow:**
- Port 80 may be in use
- Change Apache port or stop conflicting apps
- Check Skype, IIS, or other services

**Login Issues:**
- Clear browser cache and localStorage
- Check database has default users
- Verify PHP session support enabled

---

## Future Enhancements

### Planned Features
1. **File Upload System**
   - Document attachments for events
   - Multiple file types (PDF, DOC, images)
   - File size validation
   - Storage management

2. **Google OAuth Integration**
   - SLU domain restriction
   - Single sign-on
   - Automatic account creation

3. **Email Notifications**
   - Submission confirmations
   - Status update notifications
   - Reminder emails

4. **Advanced Reporting**
   - Analytics dashboard
   - Export to Excel/PDF
   - Submission trends
   - Activity reports

5. **User Management**
   - Admin interface to manage users
   - Bulk account creation
   - Password reset functionality
   - Account deactivation

6. **Enhanced Security**
   - Password hashing migration
   - Two-factor authentication
   - Session timeout warnings
   - Audit logging

7. **Mobile App**
   - Native mobile applications
   - Push notifications
   - Offline capability

---

## API Reference Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/login.php` | POST | None | User authentication |
| `/api/submit-form.php` | POST | Client | Submit organization form |
| `/api/get-submissions.php` | GET | Admin/Client | Retrieve submissions |
| `/api/update-submission-status.php` | POST | Admin | Update submission status |
| `/api/update-activity.php` | POST | Any | Update user activity |
| `/api/get-online-users.php` | GET | Admin | Get online users |
| `/api/get-documents.php` | GET | Admin | Get documents (placeholder) |

---

## Database Schema Summary

| Table | Records | Primary Key | Foreign Keys |
|-------|---------|-------------|--------------|
| `admin` | OSA staff accounts | adminid | None |
| `client` | Organization accounts | clientid | None |
| `org_form_submissions` | Form submissions | id | clientid |
| `org_events` | Event details | event_id | submission_id |
| `login_activity` | Login tracking | activityid | None |

---

## Support & Maintenance

### Version Information
- **System Version**: 1.0
- **Database Version**: 1.0
- **PHP Version**: 8.3.14
- **MySQL Version**: 9.1.0
- **Last Updated**: November 3, 2025

### Contact
For questions, issues, or feature requests, contact the development team.

---

## Glossary

- **OSA**: Office of Student Affairs
- **CBL**: Character Building and Leadership
- **SLU**: Saint Louis University
- **WAMP**: Windows, Apache, MySQL, PHP
- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **XSS**: Cross-Site Scripting
- **CSRF**: Cross-Site Request Forgery
- **OAuth**: Open Authorization

---

*End of Documentation*

# OSA Forms - Dynamic Submission Updates

## Overview
Updated the OSA Forms page to dynamically load and display form submissions from student organizations through the database API.

## Changes Made

### 1. Database Setup
- **Created:** `sql/create_org_form_submissions.sql`
  - Creates the `org_form_submissions` table to store organization form submissions
  - Includes all necessary fields: submission title, organization info, applicant info, adviser info, category, type, CBL status, video link, and status
  - Linked to the `client` table via foreign key

**To set up the database:**
```sql
-- Run this SQL file in your MySQL database
source sql/create_org_form_submissions.sql;
```

### 2. JavaScript Updates (`scripts/osa-scripts/osa-forms.js`)

#### New Functions:
- **`loadSubmissions()`**: Fetches submissions from `/api/get-submissions.php` and populates the table
- **`formatDate(dateString)`**: Formats database dates to readable format (MM/DD/YY)

#### Modified Functions:
- **`openViewModal(submissionId)`**: Now accepts submission ID and fetches full data from the stored submission object to populate all modal fields
- **`updateTableDisplay(data)`**: Now generates table rows dynamically from the fetched data instead of cloning static HTML elements
- **`refreshForms()`**: Simplified to reload data from API
- **`showNotification(message, type)`**: Added 'info' type for informational messages

#### Removed:
- Static data loading from HTML DOM elements

### 3. HTML Updates (`osa-staff/osa-forms.html`)

#### Modal Updates:
Added unique IDs to all modal fields for dynamic data binding:
- `modalOrgFullName` - Full organization name
- `modalOrgAcronym` - Organization acronym
- `modalOrgEmail` - Organization email
- `modalSocialMedia` - Social media links
- `modalApplicantName` - Applicant name
- `modalApplicantPosition` - Applicant position
- `modalApplicantEmail` - Applicant email
- `modalAdviserNames` - Adviser names
- `modalAdviserEmails` - Adviser emails
- `modalCategory` - Organization category
- `modalOrgType` - Organization type
- `modalCblStatus` - CBL status
- `modalVideoLink` - Video link

#### Table Updates:
- Removed static table rows
- Table now populates dynamically via JavaScript

### 4. API Files (Already Existing)

#### `api/submit-form.php`
- Handles form submissions from student organizations
- Inserts data into `org_form_submissions` table
- Returns success/error response with submission ID

#### `api/get-submissions.php`
- Fetches submissions based on user type:
  - **Organizations (client)**: Only their own submissions
  - **OSA Staff (admin)**: All submissions
- Joins with `client` table to get organization details
- Returns JSON array of submissions

## Features

### For OSA Staff:
1. **View All Submissions**: See all form submissions from all organizations
2. **Dynamic Updates**: Table automatically updates when new forms are submitted
3. **Search & Filter**: Search by title, organization, submitter, school, or status
4. **Sort Options**: Sort by date (newest/oldest), name (A-Z/Z-A), or organization
5. **Pagination**: Navigate through submissions with customizable items per page
6. **View Details**: Click "View" button to see full submission details in a modal
7. **Refresh**: Manually refresh data to see the latest submissions

### Modal Features:
- Display all submission information:
  - Submission title and metadata (date, status)
  - Organization details (full name, acronym, email, social media)
  - Applicant information (name, position, email)
  - Adviser information (names, emails)
  - Category and organization type
  - CBL status and video link
- Future: Approve/Return buttons for workflow management

## How It Works

### Submission Flow:
1. **Student Organization** fills out form in `org/org-form.html`
2. Form submits to `/api/submit-form.php`
3. Data is saved in `org_form_submissions` table
4. **OSA Staff** opens `osa-staff/osa-forms.html`
5. Page automatically loads submissions via `/api/get-submissions.php`
6. Staff can view, search, sort, and manage submissions

### Data Flow:
```
Organization Form → submit-form.php → Database → get-submissions.php → OSA Forms Page
```

## Installation

1. **Import the database table:**
   ```bash
   mysql -u root -p slu_org_db < sql/create_org_form_submissions.sql
   ```

2. **Clear browser cache** to ensure updated JavaScript loads

3. **Test the flow:**
   - Login as an organization (e.g., username: `samcis`, password: `samcis123`)
   - Fill out and submit the form at `/org/org-form.html`
   - Login as OSA staff (username: `osa`, password: `osa123`)
   - View submissions at `/osa-staff/osa-forms.html`
   - Click "View" to see full details

## Technical Notes

- Uses **fetch API** for AJAX requests
- Implements **pagination** with configurable items per page
- **Responsive design** maintained
- **Session-based authentication** via PHP
- **Real-time updates** via Refresh button
- **Error handling** with user-friendly notifications

## Future Enhancements

1. **Approval Workflow**: Implement Approve/Return functionality
2. **Document Uploads**: Add file upload support
3. **Comments System**: Allow OSA to add comments/feedback
4. **Email Notifications**: Notify organizations of status changes
5. **Export Feature**: Export submissions to PDF/Excel
6. **Advanced Filters**: Filter by date range, status, school
7. **Bulk Actions**: Approve/return multiple submissions at once

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## Dependencies
- PHP 7.4+
- MySQL 8.0+
- Modern browser with ES6 support

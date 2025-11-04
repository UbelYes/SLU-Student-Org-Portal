# SLU Student Organization Portal

A comprehensive web portal for Saint Louis University's Office of Student Affairs (OSA) to manage student organizations, form submissions, and administrative tasks. The system provides role-based access for administrators, OSA staff, and student organizations.

## Features

- 🔐 **Secure Authentication** - Role-based login system (Admin, OSA Staff, Organizations)
- 📋 **Form Management** - Student organizations can submit end-term requirements with event details
- ✅ **Submission Review** - OSA staff can approve or return submissions with feedback
- 📊 **Admin Dashboard** - Real-time monitoring of online users and system activity
- 📄 **Document Management** - Centralized document storage and retrieval
- 🔍 **Search & Filter** - Advanced filtering and sorting capabilities
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Prerequisites

- **WAMP Server** (Windows, Apache, MySQL, PHP 7.4+)
- **Web Browser** - Modern browser (Chrome, Firefox, Edge, Safari)
- **MySQL** - Version 5.7 or higher

## Installation Steps

### 1. Install WAMP Server

1. Download [WAMP Server](https://www.wampserver.com/en/) (64-bit recommended)
2. Run the installer and follow the setup wizard
3. Launch WAMP and wait for the icon to turn **green** in the system tray
   - **Red** = Services stopped
   - **Orange** = Some services running
   - **Green** = All services running

### 2. Set Up the Project

1. Navigate to your WAMP `www` directory: `c:\wamp64\www\`
2. Place this project folder directly in the `www` directory
3. Your path should be: `c:\wamp64\www\` (if the project is the root)
   - Or: `c:\wamp64\www\[project-folder]\` (if in a subfolder)

### 3. Import the Database

1. Start WAMP Server (ensure icon is green)
2. Open your browser and go to: `http://localhost/phpmyadmin`
3. Click on the **"New"** button in the left sidebar (or skip if database already exists)
4. Click on **"Import"** tab at the top
5. Click **"Choose File"** and select: `sql/312team-unbelibables-mid.sql`
6. Scroll down and click **"Go"** to import
   - This creates the database `slu_org_db` with tables, sample data, and user accounts

### 4. Configure Database Connection (If Needed)

If you've customized your MySQL credentials, update the connection file:

**File:** `api/db.php`

```php
$DB_HOST = 'localhost';      // MySQL host
$DB_USER = 'root';           // Your MySQL username (default: root)
$DB_PASS = '';               // Your MySQL password (default: empty)
$DB_NAME = 'slu_org_db';     // Database name
```

### 5. Verify Installation

1. Open browser and go to: `http://localhost/`
2. You should see the login page
3. Test login with default credentials (see below)

---

## Running the Application

### Starting the Server

1. **Launch WAMP Server**
   - Double-click the WAMP icon on desktop, or
   - Find WAMP in Start Menu and launch it

2. **Wait for green icon**
   - Check system tray for WAMP icon
   - Green = Ready to use
   - If orange/red, click icon → check services

3. **Access the application**
   - Open browser
   - Navigate to: `http://localhost/` or `http://localhost/index.html`

---

## User Roles & Login Credentials

The system includes three user roles with different access levels:

### 1. 👨‍💼 **Admin (Super Administrator)**

**Login Credentials:**
- **Email:** `admin@slu.edu.ph`
- **Password:** `admin123`

**Access:**
- Admin Dashboard: `http://localhost/admin/admin-dashboard.html`

**Capabilities:**
- Monitor all online users in real-time
- View all organizations and their status
- View all OSA staff members
- Track system-wide activity
- Access system statistics

---

### 2. 👩‍💼 **OSA Staff**

**Login Credentials:**
- **Email:** `osa@slu.edu.ph`
- **Password:** `osa123`

**Access:**
- Forms Management: `http://localhost/osa-staff/osa-forms.html`
- Documents: `http://localhost/osa-staff/osa-documents.html`

**Capabilities:**
- View all form submissions from all organizations
- Approve submissions
- Return submissions with feedback for revision
- View detailed submission information including events
- Manage documents (planned feature)
- Search and filter submissions

---

### 3. 🎓 **Student Organization**

**Login Credentials (Sample - ICON Organization):**
- **Email:** `icon@slu.edu.ph`
- **Password:** `icon123`

**Access:**
- Submission Form: `http://localhost/org/org-form.html`
- Submission History: `http://localhost/org/org-submissions.html`

**Capabilities:**
- Submit end-term requirement forms
- Add multiple events with details (name, date, venue, description, participants, budget)
- View own submission history
- Check submission status (Pending, Approved, Returned)
- Read OSA feedback on submissions
- Search and filter own submissions
- View detailed information of past submissions

---

## How to Use the System

### For Student Organizations

#### Submitting a Form

1. **Login** at `http://localhost/`
   - Enter organization email and password
   - Click "Login"

2. **Navigate to Form**
   - Click "Form" in the sidebar
   - Or go directly to: `http://localhost/org/org-form.html`

3. **Fill Out the Form**
   
   **Required Information:**
   - Submission Title (e.g., "End-Term Requirements AY 2024-2025")
   - Organization Information (name, acronym, email)
   - Applicant Information (name, position, email)
   - Adviser Information (names and emails)
   - Category (SAMCIS, SEA, SOM, SONAHBS, SOL, STELA, University-Wide)
   - Organization Type (Co-Curricular, Extra-Curricular, Publication)
   - CBL Status (With/Without Revisions)

   **Event Details (at least one required):**
   - Event Name
   - Event Date
   - Venue
   - Description
   - Expected Participants
   - Budget Estimate (optional)

4. **Add Multiple Events**
   - Click "+ Add Another Event" to add more events
   - Each event can have different details

5. **Submit**
   - Review all information
   - Click "Submit Form"
   - Confirmation message will appear
   - You'll be redirected to Submission History

#### Viewing Submissions

1. **Go to Submission History**
   - Click "Submission History" in sidebar
   - Or: `http://localhost/org/org-submissions.html`

2. **Browse Submissions**
   - See all your past submissions
   - Status indicators: **Pending** (yellow), **Approved** (green), **Returned** (red)

3. **Search & Filter**
   - Search by title or organization name
   - Filter by status (All, Pending, Approved, Returned)
   - Sort by date, title, or status

4. **View Details**
   - Click "View" button on any submission
   - See complete form details
   - Read OSA feedback (if provided)

---

### For OSA Staff

#### Reviewing Submissions

1. **Login** as OSA Staff
   - Email: `osa@slu.edu.ph` / Password: `osa123`

2. **Go to Forms Page**
   - Automatically directed after login, or
   - Click "Forms" in navigation

3. **Browse Submissions**
   - View all submissions from all organizations
   - Use search bar to find specific submissions
   - Sort by date, name, organization, or status

4. **Review a Submission**
   - Click "View" on any submission
   - Modal opens with complete details
   - Review organization info, events, and requirements

5. **Provide Feedback**
   - Scroll to "OSA Feedback" section
   - Enter feedback/notes in the textarea

6. **Take Action**
   
   **To Approve:**
   - Click "Approve" button
   - Confirmation prompt appears
   - Status changes to "Approved"
   - Feedback is saved

   **To Return for Revision:**
   - Enter detailed feedback explaining what needs revision
   - Click "Return for Revision" button
   - Confirmation prompt appears
   - Status changes to "Returned"
   - Organization will see the feedback

---

### For Admin

#### Monitoring System Activity

1. **Login** as Admin
   - Email: `admin@slu.edu.ph` / Password: `admin123`

2. **View Dashboard**
   - Automatically directed to: `/admin/admin-dashboard.html`

3. **Monitor Statistics**
   - **Organizations Online** - Real-time count
   - **OSA Staff Online** - Active staff members
   - **Total Users** - System-wide user count

4. **View Active Users**
   - **Online Users Tab** - See who's currently active
   - Shows user type, name/organization, email, last activity
   - Status: Online (green) or Offline (red)

5. **Manage Organizations**
   - **All Organizations Tab** - Complete list
   - Filter by status (Active/Inactive)
   - Search by name, username, or email
   - View last login times

6. **Manage OSA Staff**
   - **OSA Staff Tab** - All staff members
   - View roles and access levels
   - Monitor last login activity
   - Filter by status

7. **Refresh Data**
   - Click "Refresh" button to update real-time data
   - Activity tracking updates every 2 minutes automatically

---

## Project Structure

```
c:\wamp64\www\
│
├── index.html                          # Login page (main entry point)
├── README.md                           # This file
├── SYSTEM_DOCUMENTATION.md            # Technical documentation
│
├── admin/                              # Admin section
│   └── admin-dashboard.html           # Admin monitoring dashboard
│
├── org/                                # Organization section
│   ├── org-form.html                  # Submission form
│   └── org-submissions.html           # Submission history
│
├── osa-staff/                          # OSA Staff section
│   ├── osa-forms.html                 # Forms management
│   └── osa-documents.html             # Document management
│
├── api/                                # Backend PHP scripts
│   ├── db.php                         # Database connection
│   ├── login.php                      # Authentication
│   ├── submit-form.php                # Form submission
│   ├── get-submissions.php            # Retrieve submissions
│   ├── update-submission-status.php   # Approve/Return submissions
│   ├── get-online-users.php           # Real-time user tracking
│   ├── update-activity.php            # Activity updates
│   └── get-documents.php              # Document retrieval
│
├── scripts/                            # JavaScript files
│   ├── auth.js                        # Authentication logic
│   ├── login.js                       # Login functionality
│   ├── main_page.js                   # Main page scripts
│   ├── admin-scripts/                 # Admin-specific scripts
│   ├── org-scripts/                   # Organization scripts
│   └── osa-scripts/                   # OSA staff scripts
│
├── styles/                             # CSS stylesheets
│   ├── fonts.css                      # Font definitions
│   ├── login-style.css                # Login page styles
│   ├── admin-styles/                  # Admin dashboard styles
│   ├── org-styles/                    # Organization styles
│   └── osa-styles/                    # OSA staff styles
│
├── sql/                                # Database files
│   ├── 312team-unbelibables-mid.sql  # Main database with sample data
│   └── migration_add_feedback_remove_video.sql  # Migration script
│
└── resources/                          # Static assets
    ├── images/                        # Logos and images
    ├── icons/                         # UI icons
    └── fonts/                         # Custom fonts
```

---

## Features in Detail

### 🔐 Authentication System
- Secure session-based authentication
- Role-based access control (RBAC)
- Automatic session timeout
- Password protection (supports hashing)

### 📋 Form Submission System
- Multi-step form with validation
- Dynamic event entry (add unlimited events)
- Real-time field validation
- Draft auto-save (planned)

### ✅ Approval Workflow
- Three status levels: Pending → Approved/Returned
- Feedback mechanism for revisions
- Email notifications (planned)
- Submission history tracking

### 📊 Admin Dashboard
- Real-time activity monitoring
- User session tracking
- System statistics overview
- Online/offline status indicators

### 🔍 Search & Filter
- Full-text search across submissions
- Multi-criteria filtering
- Sort by date, title, status, organization
- Pagination for large datasets

---

## Troubleshooting

### Common Issues

#### ❌ Database Connection Error

**Problem:** Cannot connect to database

**Solutions:**
1. Verify WAMP is running (green icon)
2. Check MySQL service: WAMP icon → MySQL → Service → Start/Resume
3. Confirm database exists: Open phpMyAdmin → Check for `slu_org_db`
4. Verify credentials in `api/db.php`

#### ❌ Page Not Found (404 Error)

**Problem:** Cannot access pages

**Solutions:**
1. Verify project location: Must be in `c:\wamp64\www\`
2. Check URL: Should start with `http://localhost/`
3. Verify file exists in the correct location
4. Clear browser cache (Ctrl + Shift + Delete)

#### ❌ WAMP Icon is Orange/Yellow

**Problem:** Services not fully started

**Solutions:**
1. **Port 80 in use:**
   - Stop Skype/IIS/Other apps using port 80
   - Or change Apache port: WAMP icon → Tools → Use a different port

2. **Missing dependencies:**
   - Install Visual C++ Redistributable packages
   - Download from Microsoft website

3. **Service not started:**
   - WAMP icon → MySQL/Apache → Service → Start

#### ❌ Login Not Working

**Problem:** Cannot login with credentials

**Solutions:**
1. Verify database is imported correctly
2. Check `client` and `admin` tables have data
3. Clear browser cookies and cache
4. Try default credentials exactly as listed
5. Check browser console for JavaScript errors (F12)

#### ❌ Forms Not Submitting

**Problem:** Form submission fails

**Solutions:**
1. Open browser console (F12) and check for errors
2. Verify all required fields are filled
3. Check at least one event is added
4. Ensure database connection is working
5. Check `api/submit-form.php` for PHP errors

#### ❌ Submissions Not Showing

**Problem:** Submission history is empty

**Solutions:**
1. Verify you're logged in as the correct organization
2. Check if submissions exist in database (phpMyAdmin)
3. Clear browser cache
4. Check browser console for API errors
5. Verify `api/get-submissions.php` is accessible

---

## Database Information

### Database Name
`slu_org_db`

### Main Tables
- `admin` - Administrator accounts
- `client` - Organization accounts  
- `org_form_submissions` - Form submissions
- `org_events` - Event details for each submission
- `login_activity` - User activity tracking

### Sample Data Included
- 1 Admin account
- 1 OSA Staff account
- 1 Organization account (ICON)
- 3 Sample submissions with different statuses
- 7 Sample events across submissions

---

## Security Notes

⚠️ **Important:** This is a development version with default credentials

**For Production Deployment:**
1. Change all default passwords
2. Use password hashing (bcrypt/password_hash)
3. Enable HTTPS/SSL
4. Implement CSRF protection
5. Add rate limiting
6. Enable SQL injection prevention (already using prepared statements)
7. Set up regular backups
8. Configure proper error logging
9. Implement session security measures
10. Add input sanitization

---

## Browser Compatibility

✅ **Fully Supported:**
- Google Chrome (90+)
- Mozilla Firefox (88+)
- Microsoft Edge (90+)
- Safari (14+)

⚠️ **Partial Support:**
- Internet Explorer 11 (not recommended)

---

## Performance Tips

1. **Use latest WAMP version** for better PHP performance
2. **Enable OpCache** in PHP for faster execution
3. **Index database tables** (already included in schema)
4. **Clear browser cache** periodically
5. **Use Chrome/Firefox** for best performance

---

## Future Enhancements

📌 Planned features for future versions:

- ✉️ Email notifications for status changes
- 📎 File upload for documents and attachments
- 📄 PDF export of submissions
- 📊 Advanced reporting and analytics
- 🔔 Real-time notifications
- 📱 Mobile app integration
- 🌐 Multi-language support
- 🔍 Advanced search with filters
- 📅 Calendar integration for events
- 💬 Comments/discussion threads

---

## Support & Contact

For technical support, bug reports, or feature requests:

- **Repository:** [GitHub - SLU-Student-Org-Portal](https://github.com/UbelYes/SLU-Student-Org-Portal)
- **Branch:** `aj-development-branch`
- **Development Team:** Team Unbelievables

---

## License

This project is developed for Saint Louis University's Office of Student Affairs.

---

## Version History

- **v1.0** (November 2025) - Initial release with core features
  - User authentication and role-based access
  - Form submission and approval workflow
  - Admin dashboard and monitoring
  - Feedback system for returned submissions
  - Search, filter, and sort capabilities

---

**Last Updated:** November 4, 2025  
**Team:** 312 Team Unbelievables  
**Project:** Mid-term Deliverable

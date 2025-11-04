# SLU Student Organization Portal

A web portal for Saint Louis University's Office of Student Affairs (OSA) to manage student organizations, forms, and submissions.

## Prerequisites

- **WAMP Server** (Windows, Apache, MySQL, PHP)
- A modern web browser (Chrome, Firefox, Edge, etc.)

## Installation Steps

### 1. Install WAMP Server

- Download and install [WAMP Server](https://www.wampserver.com/en/)
- Make sure WAMP is running (the icon should be green)

### 2. Set Up the Project

- Place this project folder in `c:\wamp64\www\`
- The path should look like: `c:\wamp64\www\[project-folder]\`
### 3. extract the folder contents
- cut all the files inside `c:\wamp64\www\[project-folder]\`
- paste those files in `c:\wamp64\www\`
- index.html path should be `c:\wamp64\www\index.html`
### 4. Set Up the Database

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click on "Import" tab
3. Choose the file: `tableswithconstraints.sql`
4. Click "Go" to import the database
   - This will create the database `slu_org_db` with all required tables

### 4. Configure Database Connection (Optional)

- If you changed your MySQL credentials, edit `api\db.php`:
  ```php
  $DB_HOST = 'localhost';
  $DB_USER = 'root';        // Your MySQL username
  $DB_PASS = '';            // Your MySQL password
  $DB_NAME = 'slu_org_db';
  ```

## Running the Website

1. Make sure WAMP is running (green icon in system tray)
2. Open your browser
3. Navigate to: `http://localhost/index.html`

## User Access

The portal has three types of users:

- **Admin** - Access admin dashboard at `/admin/admin-dashboard.html`
- **OSA Staff** - Manage accounts, forms, and documents
- **Organizations** - Submit forms and view submissions at `/org/org-form.html`

## Project Structure

- `index.html` - Login page
- `admin/` - Admin dashboard and pages
- `org/` - Organization pages and forms
- `osa-staff/` - OSA staff management pages
- `api/` - Backend PHP scripts for database operations
- `scripts/` - JavaScript files
- `styles/` - CSS stylesheets
- `sql/` - Database schema and setup files

## Troubleshooting

**Database Connection Error:**

- Make sure WAMP is running (green icon)
- Check if MySQL service is started
- Verify database name is `slu_org_db` in phpMyAdmin

**Page Not Found:**

- Verify the project is in `c:\wamp64\www\`
- Check that you're using the correct URL path

**WAMP Icon is Orange/Yellow:**

- Port 80 might be in use by another application
- Try changing Apache port or close conflicting applications

## Support

For questions or issues, contact the development team.

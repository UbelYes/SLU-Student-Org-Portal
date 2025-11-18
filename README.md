# Student Organization Portal - Simplified

A basic web portal for managing student organization submissions with simple HTML/CSS/JS and minimal PHP database operations.

---

## 🚀 Quick Setup (3 Steps)

1. **Import Database**
   ```bash
   # Open phpMyAdmin: http://localhost/phpmyadmin
   # Import sql/simple_schema.sql
   ```

2. **Configure Database Connection**
   - Edit `api/db.php` with your credentials:
   ```php
   $host = 'localhost';
   $username = 'root';
   $password = 'your_password';
   $database = 'simple_portal';
   ```

3. **Start WAMP & Access**
   - Start WAMP server (green icon)
   - Visit `http://localhost/`

> ⚠️ **Important**: Place all files in `c:\wamp64\www\` (not in a subfolder)

---

## 🎯 Features

- ✅ Basic submission forms with preserved original design
- ✅ View submissions list
- ✅ Simple database read/write operations
- ✅ Clean navigation between pages
- ❌ No authentication (simple email-based routing)
- ❌ No file uploads
- ❌ No activity tracking

---

## 🔑 Login (Simple Routing)

| Email Contains | Redirects To |
|----------------|--------------|
| `admin` | Admin Dashboard |
| `osa` | OSA Forms Page |
| Other emails | Organization Form |

**Note**: No password required - just basic routing based on email pattern.

---

## 📊 Database Schema

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

## 🔌 API Endpoints

### Read Operations
- **GET** `/api/read.php`
  - Returns all submissions as JSON
  - Response: `{"success": true, "records": [...]}`

### Write Operations  
- **POST** `/api/write.php`
  - Create new submission
  - Body: `{org_name, submission_title, applicant_name}`
  - Response: `{"success": true, "id": 123}`

- **DELETE** `/api/write.php`
  - Delete submission by ID
  - Body: `{id: 123}`
  - Response: `{"success": true}`

---

## 📁 Project Structure

```
├── index.html              # Login page
├── admin/
│   └── admin-dashboard.html
├── org/
│   ├── org-form.html
│   └── org-submissions.html
├── osa-staff/
│   ├── osa-forms.html
│   └── osa-documents.html
├── api/
│   ├── db.php             # Database connection
│   ├── read.php           # Fetch submissions
│   └── write.php          # Create/delete submissions
├── scripts/
│   ├── login.js           # Simple routing
│   ├── utils.js           # Shared utilities
│   ├── admin-scripts/
│   ├── org-scripts/
│   └── osa-scripts/
├── styles/                # All CSS preserved
├── resources/             # Images, icons, fonts
└── sql/
    └── simple_schema.sql  # Simplified database
```

---

## ❓ Common Issues

**Q: WAMP icon is orange or yellow?**  
A: Wait for all services to start. Check port 80 isn't used by Skype/IIS.

**Q: Database connection error?**  
A: Verify credentials in `api/db.php` match your MySQL setup.

**Q: Page shows blank/error?**  
A: Check browser console (F12) for JavaScript errors. Ensure all files are in correct paths.

**Q: Forms not submitting?**  
A: Verify `api/write.php` exists and database table 'submissions' is created from `simple_schema.sql`.

**Q: Page not found?**  
A: Files must be in `c:\wamp64\www\` (not in a subfolder). URL should be `http://localhost/` not `http://localhost/[folder]/`.

---

## 🔧 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+) - No frameworks
- **Backend**: PHP 7.4+ (minimal - only database operations)
- **Database**: MySQL 5.7+
- **Server**: WAMP/LAMP/MAMP

---

## 📝 What Was Removed

This is a simplified reset version. The following features were removed:

- ❌ User authentication & sessions
- ❌ Password validation
- ❌ Activity tracking & monitoring
- ❌ File upload system
- ❌ Document management
- ❌ Feedback/comments system
- ❌ Real-time status updates
- ❌ Complex state management
- ❌ Multi-table database relationships

---

## ✨ What's Preserved

- ✅ All HTML pages with original design and layout
- ✅ All CSS styling and responsive design
- ✅ Basic form interactions
- ✅ Simple page navigation
- ✅ Core database CRUD operations
- ✅ Clean, maintainable code structure

---

## 🔐 Important Notes

⚠️ **This is a development/learning version**:
- No authentication system (routing based on email pattern only)
- No input sanitization beyond basic escaping
- Suitable for local development and learning PHP/MySQL basics
- Before production: Add authentication, input validation, and security measures

---

**Made simple for learning and basic functionality**

# SLU Student Organization Portal

A web portal for Saint Louis University's Office of Student Affairs (OSA) to manage student organization form submissions, approvals, and administrative tasks.

## � Quick Start

### 1. Prerequisites
- [WAMP Server](https://www.wampserver.com/en/) (Windows, Apache, MySQL, PHP 7.4+)

### 2. Installation
1. Install WAMP Server and start it (wait for **green** icon in system tray)
2. Place this project in `c:\wamp64\www\`
3. Import database:
   - Open `http://localhost/phpmyadmin`
   - Click **Import** → Choose file: `sql/312team-unbelibables-mid.sql`
   - Click **Go**

### 3. Launch
Open your browser and go to: **`http://localhost/`**

---

## 🔑 Login Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | `admin@slu.edu.ph` | `admin123` | Monitor users & activity |
| **OSA Staff** | `osa@slu.edu.ph` | `osa123` | Review & approve submissions |
| **Organization** | `icon@slu.edu.ph` | `icon123` | Submit forms & view history |

---

## ✨ Key Features

### 📋 For Organizations
- Submit end-term requirement forms with multiple events
- Track submission status (Pending/Approved/Returned)
- View OSA feedback and revision requests
- Search and filter submission history

### ✅ For OSA Staff
- Review all organization submissions
- Approve or return submissions with feedback
- Search, filter, and sort submissions
- Manage documents

### 📊 For Admins
- Real-time monitoring of online users
- View all organizations and OSA staff
- Track system activity
- Access system statistics

---

## 🔧 Troubleshooting

**WAMP not green?**
- Stop apps using port 80 (Skype, IIS)
- Install Visual C++ Redistributable

**Can't login?**
- Verify database is imported
- Clear browser cache/cookies
- Check WAMP is running (green icon)

**Page not found?**
- Ensure project is in `c:\wamp64\www\`
- URL should be `http://localhost/`

**Database connection error?**
- Check WAMP is running
- Verify MySQL service is started
- Check `api/db.php` credentials (default: root, no password)

---

## 📁 Project Structure

```
c:\wamp64\www\
├── index.html              # Login page
├── admin/                  # Admin dashboard
├── org/                    # Organization forms & submissions
├── osa-staff/              # OSA forms & documents
├── api/                    # Backend PHP scripts
├── scripts/                # JavaScript files
├── styles/                 # CSS stylesheets
├── sql/                    # Database file
└── resources/              # Images, icons, fonts
```

---

## 🔐 Security Notes

⚠️ **For Development Only** - Before production deployment:
- Change all default passwords
- Enable password hashing
- Set up HTTPS/SSL
- Configure proper error logging

---

**Team:** 312 Team Unbelievables  
**Last Updated:** November 4, 2025  
**Repository:** [SLU-Student-Org-Portal](https://github.com/UbelYes/SLU-Student-Org-Portal)  
**Branch:** aj-development-branch

# SLU Student Organization Portal

A web portal for Saint Louis University's Office of Student Affairs (OSA) to manage student organization submissions and approvals.

---

## 🚀 Getting Started

### Install & Run (3 Steps)

1. **Install WAMP** - Download from [wampserver.com](https://www.wampserver.com/en/) and wait for green icon
2. **Import Database** - Open `http://localhost/phpmyadmin` → Import → Choose `sql/slu_org_db.sql` → Go
3. **Open Portal** - Visit `http://localhost/` in your browser

> ⚠️ **Important**: Place all project files directly in `c:\wamp64\www\` (not in a subfolder)

---

## 🔑 Test Accounts

| User Type | Email | Password | What You Can Do |
|-----------|-------|----------|-----------------|
| **Organization** | `icon@slu.edu.ph` | `icon123` | Submit forms, upload files, track status |
| **OSA Staff** | `osa@slu.edu.ph` | `osa123` | Review submissions, download files |
| **Admin** | `admin@slu.edu.ph` | `admin123` | Monitor users and activity |

---

## 📋 What Can You Do?

### As an Organization
1. **Submit Forms** - Fill out end-term requirements with multiple events
2. **Upload Files** - Attach PDFs or images (max 10MB each)
3. **Track Status** - See if your submission is Pending, Approved, or Returned
4. **Read Feedback** - View comments from OSA staff

### As OSA Staff
1. **Review Submissions** - View all organization submissions
2. **Manage Documents** - Browse and download all uploaded files
3. **Approve/Return** - Accept submissions or send back with feedback
4. **Search & Filter** - Find specific submissions quickly

### As Admin
1. **Monitor Activity** - See who's online right now
2. **View Statistics** - Check total users and submissions
3. **Track History** - Review login activity

---

## ❓ Common Issues

**WAMP icon not green?**
- Close Skype or other apps using port 80
- Install Visual C++ Redistributable

**Can't login?**
- Check WAMP is running (green icon)
- Make sure database is imported
- Try clearing browser cookies

**File upload failed?**
- Only PDF and image files allowed
- File must be under 10MB
- Check that `uploads/` folder exists

**Page not found?**
- Files must be in `c:\wamp64\www\` (not in a subfolder)
- URL should be `http://localhost/` not `http://localhost/[folder]/`

---

## � Need More Details?

See **SYSTEM_DOCUMENTATION.md** for:
- Complete database structure
- API endpoints
- Security features
- Technical architecture

---

**Team Unbelievables** | 312 Database Management | Saint Louis University
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

**Team:** 312 Team Unbeliebables  
**Last Updated:** November 4, 2025  
**Repository:** [SLU-Student-Org-Portal](https://github.com/UbelYes/SLU-Student-Org-Portal)  
**Branch:** aj-development-branch

# Quick Start Guide - Login System

## 🚀 Quick Test

### Option 1: Use Main Login Page
1. Open `index.html` in your browser
2. Choose a test account from below
3. Enter email and password
4. Click "Sign In to Portal"

### Option 2: Use Student Org Login Page
1. Open `org/index.html` in your browser
2. Use any student org credentials
3. Click "Sign In to Portal"

## 📋 Test Credentials

### 👨‍💼 Admin Accounts
```
Email: admin@slu.edu.ph
Password: admin123
→ Goes to: Admin Dashboard
```

### 👔 OSA Staff Accounts
```
Email: staff@slu.edu.ph
Password: staff123
→ Goes to: OSA Staff Dashboard
```

### 🎓 Student Organization Accounts
```
Email: samcis@slu.edu.ph
Password: samcis123
→ Goes to: Student Org Dashboard

Email: icon@slu.edu.ph
Password: icon123
→ Goes to: Student Org Dashboard
```

## 🔄 Login Flow

```
┌─────────────────┐
│  index.html     │
│  (Login Page)   │
└────────┬────────┘
         │
         │ Enter credentials
         │
         ▼
┌─────────────────────────┐
│  osa-login.js           │
│  Validates & checks role│
└───────┬─────────────────┘
        │
        ├─── Admin? ────────────► /admin/admin-dashboard.html
        │
        ├─── OSA Staff? ────────► /osa-staff/osa-forms.html
        │
        └─── Student Org? ──────► /org/org-dashboard.html
```

## ✅ What's Working

- ✅ Login with email/password
- ✅ Role-based automatic redirection
- ✅ Protected dashboard pages
- ✅ Logout functionality
- ✅ Session persistence (stays logged in on page refresh)
- ✅ Prevents wrong role from accessing other dashboards

## 🔒 Protected Pages

All these pages now require login:
- `/admin/*` - Admin only
- `/osa-staff/*` - OSA Staff only  
- `/org/*` - Student Organizations only

If you try to access without login → redirected to login page
If you try to access wrong role's area → redirected to your correct dashboard

## 🚪 Logout

Click the logout button on any dashboard:
- Clears your session
- Returns you to login page
- Prevents back button access

## 🎯 Tips

1. **Testing Different Roles**: Logout first, then login with different account
2. **Already Logged In**: If you visit login page while logged in, you'll auto-redirect to your dashboard
3. **Browser DevTools**: Check localStorage to see stored session data
4. **Error Messages**: Invalid credentials show red error message below login button

## 🛠️ For Developers

**Session Data Stored in localStorage**:
- `isLoggedIn`: 'true' or not set
- `userEmail`: user's email address
- `userRole`: 'admin', 'osa', or 'student'
- `userName`: display name
- `userOrg`: organization name (student accounts only)

**To Clear Session Manually**:
Open browser console and run:
```javascript
localStorage.clear();
```

**To Check Current Session**:
```javascript
console.log(localStorage);
```

## 📁 File Structure

```
SLU-Student-Org-Portal/
├── index.html                     ← Main login (all roles)
├── org/
│   └── index.html                 ← Alt login (student orgs)
├── admin/
│   ├── admin-dashboard.html       ← Admin dashboard (protected)
│   └── admin-accounts.html        ← Admin accounts page (protected)
├── osa-staff/
│   ├── osa-forms.html             ← OSA forms page (protected, landing page)
│   ├── osa-documents.html         ← OSA documents (protected)
│   └── ...
├── org/
│   ├── org-dashboard.html         ← Student dashboard (protected)
│   ├── org-form.html              ← Org forms (protected)
│   └── ...
└── scripts/
    └── osa-scripts/
        └── osa-login.js           ← Login logic (handles all roles)
```

## 🐛 Troubleshooting

**Problem**: Can't login
- ✓ Check you're using exact email/password from credentials list
- ✓ Check for typos in email/password
- ✓ Try clearing browser cache and localStorage

**Problem**: Redirecting to wrong page
- ✓ Clear localStorage: `localStorage.clear()`
- ✓ Close all browser tabs
- ✓ Try again with fresh login

**Problem**: Stuck on login page
- ✓ Check browser console for JavaScript errors
- ✓ Make sure osa-login.js is loading properly
- ✓ Verify you're opening via HTTP server (not file://)

**Problem**: Already logged in, want to test different account
- ✓ Click logout button
- ✓ Or clear localStorage manually

## 📞 Need Help?

See detailed documentation in:
- `LOGIN_CREDENTIALS.md` - All test accounts
- `IMPLEMENTATION_SUMMARY.md` - Technical details

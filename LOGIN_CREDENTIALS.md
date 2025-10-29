# Login Credentials for Testing

This document contains test credentials for the SLU Student Organization Portal.

## Login Pages

- **Main Login**: `/index.html` (works for all user types)
- **Student Org Alternative Login**: `/org/index.html`

## Test Accounts

### Admin Accounts
Access admin dashboard to manage system-wide settings and view analytics.

| Email | Password | Dashboard |
|-------|----------|-----------|
| admin@slu.edu.ph | admin123 | /admin/admin-dashboard.html |
| admin2@slu.edu.ph | admin123 | /admin/admin-dashboard.html |

### OSA Staff Accounts
Access OSA staff portal to manage forms, documents, and organizations.

| Email | Password | Dashboard |
|-------|----------|-----------|
| staff@slu.edu.ph | staff123 | /osa-staff/osa-forms.html |
| osa@slu.edu.ph | osa123 | /osa-staff/osa-forms.html |

### Student Organization Accounts
Access student organization portal to submit requirements and manage organization data.

| Email | Password | Organization | Dashboard |
|-------|----------|--------------|-----------|
| samcis@slu.edu.ph | samcis123 | SAMCIS | /org/org-dashboard.html |
| icon@slu.edu.ph | icon123 | ICON | /org/org-dashboard.html |
| student@slu.edu.ph | student123 | Student Council | /org/org-dashboard.html |

## How It Works

1. **Login System**: The system uses `scripts/osa-scripts/osa-login.js` for authentication
2. **Role-Based Redirection**: Upon successful login, users are automatically redirected to their appropriate dashboard based on their role
3. **Session Management**: Login state is stored in localStorage
4. **Protected Routes**: All dashboard pages check for valid login status and redirect to login if not authenticated

## Features

- ✅ Role-based authentication (Admin, OSA Staff, Student Org)
- ✅ Automatic redirection based on user role
- ✅ Protected dashboard routes
- ✅ Logout functionality that clears session and redirects to login
- ✅ Prevents unauthorized access to other role dashboards

## Adding New Users

To add new test users, edit `scripts/osa-scripts/osa-login.js` and add entries to the `validCredentials` object:

```javascript
const validCredentials = {
    'email@slu.edu.ph': { 
        password: 'password123', 
        role: 'admin|osa|student', 
        name: 'Display Name',
        org: 'Organization Name' // only for student role
    }
};
```

## Security Note

⚠️ **This is a demonstration system with hardcoded credentials.** In a production environment:
- Implement proper backend authentication
- Use secure password hashing (bcrypt, argon2)
- Implement JWT or session-based authentication
- Add rate limiting and brute force protection
- Use HTTPS for all communications
- Implement proper CSRF protection

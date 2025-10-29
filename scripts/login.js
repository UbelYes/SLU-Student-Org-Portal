// SLU Student Organization Portal - Login System
// Handles authentication for Admin, OSA Staff, and Student Organizations

// User credentials
const validCredentials = {
    // Admin accounts
    'admin@slu.edu.ph': { 
        password: 'admin123', 
        role: 'admin', 
        name: 'Admin User',
        redirectPath: './admin/admin-dashboard.html'
    },
    'admin2@slu.edu.ph': { 
        password: 'admin123', 
        role: 'admin', 
        name: 'Admin User 2',
        redirectPath: './admin/admin-dashboard.html'
    },
    
    // OSA Staff accounts
    'staff@slu.edu.ph': { 
        password: 'staff123', 
        role: 'osa', 
        name: 'OSA Staff',
        redirectPath: './osa-staff/osa-forms.html'
    },
    'osa@slu.edu.ph': { 
        password: 'osa123', 
        role: 'osa', 
        name: 'OSA Staff 2',
        redirectPath: './osa-staff/osa-forms.html'
    },
    
    // Student Organization accounts
    'samcis@slu.edu.ph': { 
        password: 'samcis123', 
        role: 'student', 
        name: 'SAMCIS', 
        org: 'SAMCIS',
        redirectPath: './org/org-dashboard.html'
    },
    'icon@slu.edu.ph': { 
        password: 'icon123', 
        role: 'student', 
        name: 'ICON', 
        org: 'ICON',
        redirectPath: './org/org-dashboard.html'
    },
    'student@slu.edu.ph': { 
        password: 'student123', 
        role: 'student', 
        name: 'Student Org', 
        org: 'Student Council',
        redirectPath: './org/org-dashboard.html'
    }
};

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (errorMessage) {
        errorMessage.textContent = '';
    }

    // Validate credentials
    if (validCredentials[email] && validCredentials[email].password === password) {
        const userInfo = validCredentials[email];
        
        // Store user session
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', userInfo.role);
        localStorage.setItem('userName', userInfo.name);
        
        if (userInfo.org) {
            localStorage.setItem('userOrg', userInfo.org);
        }
        
        // Redirect to dashboard
        window.location.href = userInfo.redirectPath;
    } else {
        if (errorMessage) {
            errorMessage.textContent = 'Invalid email or password';
        }
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userOrg');
    
    // Redirect to login page
    const currentPage = window.location.pathname;
    if (currentPage.includes('/admin/') || currentPage.includes('/osa-staff/') || currentPage.includes('/org/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

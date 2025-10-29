// For demonstration purposes, we'll use a simple object to store credentials
// In a real application, this should be handled by a secure backend
const validCredentials = {
    // Admin accounts
    'admin@slu.edu.ph': { password: 'admin123', role: 'admin', name: 'Admin User' },
    'admin2@slu.edu.ph': { password: 'admin123', role: 'admin', name: 'Admin User 2' },
    
    // OSA Staff accounts
    'staff@slu.edu.ph': { password: 'staff123', role: 'osa', name: 'OSA Staff' },
    'osa@slu.edu.ph': { password: 'osa123', role: 'osa', name: 'OSA Staff 2' },
    
    // Student Organization accounts
    'samcis@slu.edu.ph': { password: 'samcis123', role: 'student', name: 'SAMCIS', org: 'SAMCIS' },
    'icon@slu.edu.ph': { password: 'icon123', role: 'student', name: 'ICON', org: 'ICON' },
    'student@slu.edu.ph': { password: 'student123', role: 'student', name: 'Student Org', org: 'Student Council' }
};

// Handle form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Check if the user exists and password matches
    if (validCredentials[email] && validCredentials[email].password === password) {
        const userInfo = validCredentials[email];
        
        // Store login state in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', userInfo.role);
        localStorage.setItem('userName', userInfo.name);
        if (userInfo.org) {
            localStorage.setItem('userOrg', userInfo.org);
        }
        
        // Redirect based on role
        if (userInfo.role === 'admin') {
            window.location.href = './admin/admin-dashboard.html';
        } else if (userInfo.role === 'osa') {
            window.location.href = './osa-staff/osa-forms.html';
        } else if (userInfo.role === 'student') {
            window.location.href = './org/org-dashboard.html';
        }
    } else {
        errorMessage.textContent = 'Invalid email or password';
    }
}

// Function to check login status
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    const currentPage = window.location.pathname;
    
    // If on login page and already logged in, redirect to appropriate dashboard
    if (currentPage.includes('index.html') && isLoggedIn === 'true') {
        if (userRole === 'admin') {
            window.location.href = './admin/admin-dashboard.html';
        } else if (userRole === 'osa') {
            window.location.href = './osa-staff/osa-forms.html';
        } else if (userRole === 'student') {
            window.location.href = './org/org-dashboard.html';
        }
        return;
    }
    
    // If on any protected page and not logged in, redirect to login
    if (!currentPage.includes('index.html') && isLoggedIn !== 'true') {
        // Determine the correct path back to index.html based on current location
        if (currentPage.includes('/admin/')) {
            window.location.href = '../index.html';
        } else if (currentPage.includes('/osa-staff/')) {
            window.location.href = '../index.html';
        } else if (currentPage.includes('/org/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
        return;
    }
    
    // Check if user is accessing the correct area for their role
    if (isLoggedIn === 'true' && userRole) {
        if (userRole === 'admin' && !currentPage.includes('/admin/') && !currentPage.includes('index.html')) {
            window.location.href = '../admin/admin-dashboard.html';
        } else if (userRole === 'osa' && !currentPage.includes('/osa-staff/') && !currentPage.includes('index.html')) {
            window.location.href = '../osa-staff/osa-forms.html';
        } else if (userRole === 'student' && !currentPage.includes('/org/') && !currentPage.includes('index.html')) {
            window.location.href = '../org/org-dashboard.html';
        }
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userOrg');
    
    // Determine path back to index.html based on current location
    const currentPage = window.location.pathname;
    if (currentPage.includes('/admin/') || currentPage.includes('/osa-staff/') || currentPage.includes('/org/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Check login status when page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus);

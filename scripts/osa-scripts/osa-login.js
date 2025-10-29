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
        
        // Track student access for OSA monitoring
        if (userInfo.role === 'student' && userInfo.org) {
            trackStudentAccess(email, userInfo.name, userInfo.org);
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

// Function to track student access (for OSA accounts monitoring)
function trackStudentAccess(email, name, org) {
    const accessLog = JSON.parse(localStorage.getItem('studentAccessLog') || '[]');
    const existingEntry = accessLog.find(entry => entry.email === email);
    
    if (existingEntry) {
        existingEntry.lastAccess = new Date().toISOString();
        existingEntry.sessionCount++;
    } else {
        accessLog.push({
            email: email,
            studentName: name,
            orgName: org,
            lastAccess: new Date().toISOString(),
            sessionCount: 1
        });
    }
    
    localStorage.setItem('studentAccessLog', JSON.stringify(accessLog));
}

// For demonstration purposes, we'll use a simple object to store credentials
// In a real application, this should be handled by a secure backend
const validCredentials = {
    'admin@slu.edu.ph': 'admin123',
    'staff@slu.edu.ph': 'staff123'
};

// Handle form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Check if the user exists and password matches
    if (validCredentials[email] && validCredentials[email] === password) {
        // Store login state in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        // Redirect to dashboard
        window.location.href = './osa-staff/osa-dashboard.html';
    } else {
        errorMessage.textContent = 'Invalid email or password';
    }
}

// Function to check login status
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    // If on login page and already logged in, redirect to dashboard
    if (currentPage.includes('index.html') && isLoggedIn === 'true') {
        window.location.href = './osa-staff/osa-dashboard.html';
    }
    
    // If on any other page and not logged in, redirect to login
    if (!currentPage.includes('index.html') && isLoggedIn !== 'true') {
        window.location.href = 'index.html';
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

// Check login status when page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus);

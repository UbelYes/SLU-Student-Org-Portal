// Simple login - for demonstration only
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Please enter both email and password');
        return false;
    }

    // Simple routing based on email domain
    if (email.includes('admin')) {
        window.location.href = '/pages/admin-portal.html';
    } else if (email.includes('osa')) {
        window.location.href = '/pages/osa-portal.html';
    } else {
        window.location.href = '/pages/org-portal.html';
    }
    return false;
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/index.html';
    }
}

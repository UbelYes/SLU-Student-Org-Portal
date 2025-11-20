// ADMIN PORTAL - COMBINED SCRIPTS

// Check authentication with server session
fetch('/api/logout.php')
    .then(res => res.json())
    .then(data => {
        if (!data.logged_in || data.user.type !== 'admin') {
            window.location.href = '/index.html';
        } else {
            sessionStorage.setItem('userEmail', data.user.email);
            sessionStorage.setItem('userType', data.user.type);
            sessionStorage.setItem('userName', data.user.name);
        }
    })
    .catch(() => window.location.href = '/index.html');

// NAVIGATION & LOGOUT
function handleLogout() {
    fetch('/api/logout.php', { method: 'POST' })
        .then(() => {
            sessionStorage.clear();
            window.location.href = '/index.html';
        });
}

// DASHBOARD INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin dashboard loaded');
});

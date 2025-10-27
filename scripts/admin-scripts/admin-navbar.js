// Set active button based on current page
if (window.location.pathname.includes('admin-dashboard.html')) {
    document.getElementById('dashboard-button').classList.add('active');
} else if (window.location.pathname.includes('admin-accounts.html')) {
    document.getElementById('accounts-button').classList.add('active');
}

// Optional: Add click handlers for navigation (if needed)
document.getElementById('dashboard-button').addEventListener('click', () => {
    window.location.href = 'admin-dashboard.html';
});

document.getElementById('accounts-button').addEventListener('click', () => {
    window.location.href = 'admin-accounts.html';
});

// Note: Settings button navigation can be added later if needed

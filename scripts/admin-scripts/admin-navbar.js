// Set active button based on current page
if (window.location.pathname.includes('admin-dashboard.html')) {
    const dashboardButton = document.getElementById('dashboard-button');
    if (dashboardButton) {
        dashboardButton.classList.add('active');
    }
}

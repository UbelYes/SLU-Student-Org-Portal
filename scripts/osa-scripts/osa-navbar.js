// OSA Navigation Handler
// Handles menu button clicks, active states, and page navigation

// Navigation mapping
const navigationRoutes = {
    'dashboard-button': 'osa-forms.html', // Dashboard redirects to forms
    'forms-button': 'osa-forms.html',
    'documents-button': 'osa-documents.html',
    'accounts-button': 'osa-accounts.html',
    'settings-button': 'osa-settings.html'
};

// Handle menu button clicks
document.querySelectorAll('.menu-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.menu-button').forEach(btn => 
            btn.classList.remove('active')
        );
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Save active menu to localStorage
        localStorage.setItem('activeMenu', button.id);
        
        // Navigate to the appropriate page
        const route = navigationRoutes[button.id];
        if (route) {
            window.location.href = route;
        }
    });
});

// Restore active menu state on page load
window.addEventListener('DOMContentLoaded', () => {
    const activeMenuId = localStorage.getItem('activeMenu');
    if (activeMenuId) {
        const activeButton = document.getElementById(activeMenuId);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
});

// Handle logout with confirmation
const logoutButton = document.querySelector('.logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        // Only show confirm if not using handleLogout() from osa-login.js
        if (!logoutButton.getAttribute('onclick')) {
            e.preventDefault();
            const confirmLogout = confirm("Are you sure you want to log out?");
            if (confirmLogout) {
                localStorage.removeItem('activeMenu');
                window.location.href = "../index.html";
            }
        }
    });
}
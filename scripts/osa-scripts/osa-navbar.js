// OSA Navigation Handler
// Handles menu button clicks, active states, and page navigation

// Navigation mapping
const navigationRoutes = {
    'forms-button': 'osa-forms.html',
    'documents-button': 'osa-documents.html',
    'accounts-button': 'osa-accounts.html',
    'settings-button': 'osa-settings.html'
};

// Hamburger menu toggle
const hamburgerToggle = document.getElementById('hamburger-toggle');
const navigationSidebar = document.getElementById('navigation-sidebar');

if (hamburgerToggle && navigationSidebar) {
    hamburgerToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburgerToggle.classList.toggle('active');
        navigationSidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 600) {
            if (navigationSidebar.classList.contains('active') && 
                !navigationSidebar.contains(e.target) && 
                !hamburgerToggle.contains(e.target)) {
                navigationSidebar.classList.remove('active');
                hamburgerToggle.classList.remove('active');
            }
        }
    });

    // Close sidebar when clicking a menu item on mobile
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', () => {
            if (window.innerWidth <= 600) {
                navigationSidebar.classList.remove('active');
                hamburgerToggle.classList.remove('active');
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 600) {
            navigationSidebar.classList.remove('active');
            hamburgerToggle.classList.remove('active');
        }
    });
}

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
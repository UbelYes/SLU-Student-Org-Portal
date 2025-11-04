/**
 * Hamburger Menu Handler for Organization Pages
 * Manages the mobile navigation menu toggle functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!hamburger || !sidebar || !overlay) {
        console.warn('Hamburger menu elements not found');
        return;
    }

    // Toggle menu when hamburger is clicked
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when overlay is clicked
    overlay.addEventListener('click', function() {
        closeMenu();
    });

    // Close menu when clicking a navigation link
    const navLinks = sidebar.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Only close on mobile
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    function toggleMenu() {
        const isActive = sidebar.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function openMenu() {
        hamburger.classList.add('active');
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scroll when menu is open
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore body scroll
    }
});

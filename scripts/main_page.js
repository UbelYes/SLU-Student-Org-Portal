
document.addEventListener('DOMContentLoaded', function () {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove active state from all
            navItems.forEach(btn => {
                btn.classList.remove('active-btn');
                btn.classList.add('inactive-btn');
            });

            // Add active state to the clicked one
            this.classList.remove('inactive-btn');
            this.classList.add('active-btn');
        });
    });
});


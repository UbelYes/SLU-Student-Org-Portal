// Get only the navigation menu buttons
const menuButtons = document.querySelectorAll(".menu-button");

menuButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        // Remove 'active' from all menu buttons only
        menuButtons.forEach((b) => b.classList.remove("active"));
        // Add 'active' to the clicked menu button
        btn.classList.add("active");
    });
});

document.getElementById("dashboard-button").addEventListener("click", () => {
    window.location.href = "osa-dashboard.html";
});

document.getElementById("forms-button").addEventListener("click", () => {
    window.location.href = "osa-forms.html";
});

document.getElementById("documents-button").addEventListener("click", () => {
    window.location.href = "osa-documents.html";
});

document.getElementById("accounts-button").addEventListener("click", () => {
    window.location.href = "osa-accounts.html";
});

document.getElementById("settings-button").addEventListener("click", () => {
    window.location.href = "osa-settings.html";
});

// Attach click listeners to all menu buttons
document.querySelectorAll('.menu-button').forEach(button => {
    button.addEventListener('click', () => {
        // Save the clicked button's ID so the next page knows which one to highlight
        localStorage.setItem('activeMenu', button.id);

        // Navigate based on which button was clicked
        switch (button.id) {
            case 'dashboard-button':
                window.location.href = 'osa-dashboard.html';
                break;
            case 'forms-button':
                window.location.href = 'osa-forms.html';
                break;
            case 'documents-button':
                window.location.href = 'osa-documents.html';
                break;
            case 'accounts-button':
                window.location.href = 'osa-accounts.html';
                break;
            case 'settings-button':
                window.location.href = 'osa-settings.html';
                break;
        }
    });
});

// When the page loads, highlight the previously active button
const activeMenu = localStorage.getItem('activeMenu');
if (activeMenu) {
    const activeButton = document.getElementById(activeMenu);
    if (activeButton) activeButton.classList.add('active');
}

const logoutbtn = document.querySelector('.logout-button');
logoutbtn.addEventListener("click", () => {
    window.location.href = "index.html";
    localStorage.setItem('activeMenu', 'dashboard-button'); // Clear active menu on logout
});

logoutbtn.addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        // If the user clicks "OK"
        window.location.href = "../index.html";
    } else {
        // If the user clicks "Cancel"
        console.log("Logout canceled");
    }
});
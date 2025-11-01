/**
 * Navigation Item Activator
 *
 * Handles navigation button active/inactive state toggling.
 * When a nav item is clicked, it becomes active while others become inactive.
 */

document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      navItems.forEach((btn) => {
        btn.classList.remove("active-btn");
        btn.classList.add("inactive-btn");
      });

      this.classList.remove("inactive-btn");
      this.classList.add("active-btn");
    });
  });
});

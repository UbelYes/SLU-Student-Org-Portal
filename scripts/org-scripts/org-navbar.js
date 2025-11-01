/**
 * Organization Navbar User Information Manager
 *
 * Populates sidebar navigation with logged-in user information from localStorage.
 * Displays organization name, type, and generates user initials for avatar display.
 * Automatically runs on DOM load to ensure user info is displayed correctly.
 */

function populateUserInfo() {
  const userName = localStorage.getItem("userName");
  const userOrg = localStorage.getItem("userOrg");

  const userNameElement = document.querySelector(".user-info h4");
  const userOrgElement = document.querySelector(".user-info p");

  if (userNameElement && userName) {
    userNameElement.textContent = userName;
  }

  if (userOrgElement && userOrg) {
    userOrgElement.textContent = userOrg;
  }

  updateUserAvatar(userName);
}

function updateUserAvatar(userName) {
  const avatarElement = document.querySelector(".user-avatar");

  if (avatarElement && userName) {
    const initials = userName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);

    if (!avatarElement.querySelector("img")) {
      avatarElement.textContent = initials;
      avatarElement.style.display = "flex";
      avatarElement.style.alignItems = "center";
      avatarElement.style.justifyContent = "center";
      avatarElement.style.fontSize = "18px";
      avatarElement.style.fontWeight = "bold";
    }
  }
}

document.addEventListener("DOMContentLoaded", populateUserInfo);

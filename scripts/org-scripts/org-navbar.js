// Org Navbar - Populate user information from localStorage

function populateUserInfo() {
  // Get user information from localStorage
  const userName = localStorage.getItem("userName");
  const userOrg = localStorage.getItem("userOrg");

  // Get the user info elements
  const userNameElement = document.querySelector(".user-info h4");
  const userOrgElement = document.querySelector(".user-info p");

  // Update the elements with logged-in user information
  if (userNameElement && userName) {
    userNameElement.textContent = userName;
  }

  if (userOrgElement && userOrg) {
    userOrgElement.textContent = userOrg;
  }

  // Optional: Add user initials to avatar
  updateUserAvatar(userName);
}

function updateUserAvatar(userName) {
  const avatarElement = document.querySelector(".user-avatar");

  if (avatarElement && userName) {
    // Get initials from the name (first letter of each word)
    const initials = userName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2); // Limit to 2 characters

    // Add initials to avatar if it doesn't have an image
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

// Call the function when the DOM is loaded
document.addEventListener("DOMContentLoaded", populateUserInfo);

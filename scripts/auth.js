// /scripts/auth.js - External authentication logic for both pages

// Configuration
const AUTH_CONFIG = {
  // Replace with your actual Google Client ID
  CLIENT_ID:
    "55329817491-uun6n75sib64uhkqobr93qcrmkhm4bca.apps.googleusercontent.com",
  // The redirect URI should be your dashboard page
  REDIRECT_URI: window.location.origin + "/org/org-form.html",
  // Google OAuth endpoints
  AUTH_ENDPOINT: "https://accounts.google.com/o/oauth2/v2/auth",
  TOKEN_ENDPOINT: "https://oauth2.googleapis.com/token",
  USER_INFO_ENDPOINT: "https://www.googleapis.com/oauth2/v3/userinfo",
  // Your backend API endpoints
  BACKEND_TOKEN_URL: "https://your-backend-api.com/api/auth/google/callback",
  BACKEND_USER_URL: "https://your-backend-api.com/api/user",
  // Domain restriction - for SLU students only
  HOSTED_DOMAIN: "",
};

// Authentication storage utilities
const AuthStorage = {
  setToken(token) {
    localStorage.setItem("authToken", token);
  },

  getToken() {
    return localStorage.getItem("authToken");
  },

  clearToken() {
    localStorage.removeItem("authToken");
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  setUserInfo(userInfo) {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  },

  getUserInfo() {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  },

  clearAll() {
    this.clearToken();
    localStorage.removeItem("userInfo");
  },
};

// Get Google OAuth URL
function getGoogleOAuthURL() {
  const options = {
    redirect_uri: AUTH_CONFIG.REDIRECT_URI,
    client_id: AUTH_CONFIG.CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope:
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    hd: AUTH_CONFIG.HOSTED_DOMAIN, // Restrict to SLU domain
  };

  const urlParams = new URLSearchParams(options);
  return `${AUTH_CONFIG.AUTH_ENDPOINT}?${urlParams.toString()}`;
}

// Handle Google login
function handleGoogleLogin() {
  window.location.href = getGoogleOAuthURL();
}

// Handle logout
function logout() {
  AuthStorage.clearAll();
  window.location.href = "/index.html";
}

// Process the authorization code from Google OAuth
async function processAuthCode(code) {
  try {
    // Exchange code for token via your backend
    const response = await fetch(
      `${AUTH_CONFIG.BACKEND_TOKEN_URL}?code=${code}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to exchange code for token");

    const data = await response.json();

    // Store the token
    AuthStorage.setToken(data.token);

    // Clean URL to remove the code
    window.history.replaceState({}, document.title, window.location.pathname);

    // Return success
    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
}

// Fetch user data from backend
async function fetchUserData() {
  try {
    // Try to get cached user data first
    let userData = AuthStorage.getUserInfo();

    if (userData) {
      // Return cached user data
      return userData;
    }

    // Fetch fresh user data from backend
    const token = AuthStorage.getToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(AUTH_CONFIG.BACKEND_USER_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch user data");

    userData = await response.json();

    // Cache the user data
    AuthStorage.setUserInfo(userData);

    // Return the user data
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Check if user is already authenticated
function checkAuth() {
  return AuthStorage.isAuthenticated();
}

// Helper to get URL parameters
function getUrlParams() {
  return new URLSearchParams(window.location.search);
}

// Verify if email is from SLU domain
function isValidSLUEmail(email) {
  return email.endsWith("@slu.edu.ph");
}

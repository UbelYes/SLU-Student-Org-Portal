/*
 * Admin login handler
 * - Prevents default form submit
 * - Reads email/password from the form
 * - Sends credentials to the admin login endpoint using fetch
 * - Uses `credentials: 'include'` so the server PHP/Express session cookie is stored
 * - On success, saves a few values to sessionStorage and navigates to the admin portal
 */
function handleLogin(event) {
    // Stop the form from submitting the normal way
    event.preventDefault();

    // Grab user input from form fields
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Simple client-side validation
    if (!email || !password) {
        alert('Please enter both email and password');
        return false;
    }

    // POST credentials to server. Server should create a session and set cookie.
    fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({email, password})
    })
    .then(res => res.json())
    .then(data => {
        // Log response for debugging
        console.log('Login response:', data);
        if (data.success) {
            // Keep small client-side state for UI (not used for authentication)
            sessionStorage.setItem('userEmail', data.user.email);
            sessionStorage.setItem('userType', data.user.type);
            sessionStorage.setItem('userName', data.user.name);
            // Navigate to the admin dashboard
            window.location.href = 'admin-portal.html';
        } else {
            alert(data.message || 'Invalid credentials');
        }
    })
    .catch(err => {
        console.error('Login error:', err);
    });
    
    return false;
}
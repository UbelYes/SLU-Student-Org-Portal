// SLU Student Organization Portal - Login System
// Now connects to backend PHP + MySQL instead of hardcoded credentials

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (errorMessage) {
        errorMessage.textContent = '';
    }
    try {
        const response = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Invalid email or password');
        }

        // Store user session similar to previous approach
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name || 'User');
        if (data.org) {
            localStorage.setItem('userOrg', data.org);
        } else {
            localStorage.removeItem('userOrg');
        }

        // Track user activity for admin dashboard
        if (typeof ActivityTracker !== 'undefined') {
            const userType = data.role === 'client' ? 'organization' : 
                            (data.role === 'admin' || data.role === 'osa_admin') ? 'osa_staff' : null;
            
            if (userType && data.userId) {
                ActivityTracker.setCurrentUser(data.userId, userType, {
                    name: data.name,
                    email: email,
                    org: data.org
                });
            }
        }

        // Redirect to dashboard returned by backend
        window.location.href = data.redirectPath || './index.html';
    } catch (err) {
        if (errorMessage) {
            errorMessage.textContent = err.message || 'Login failed.';
        }
    }
}

// Handle logout
function handleLogout() {
    // Clear activity tracking
    if (typeof ActivityTracker !== 'undefined') {
        ActivityTracker.clearCurrentUser();
    }

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userOrg');
    
    // Redirect to login page
    const currentPage = window.location.pathname;
    if (currentPage.includes('/admin/') || currentPage.includes('/osa-staff/') || currentPage.includes('/org/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

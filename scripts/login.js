// Simple login with database validation
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Please enter both email and password');
        return false;
    }

    // Validate credentials with database
    fetch('/api/login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Store user info
            sessionStorage.setItem('userEmail', data.user.email);
            sessionStorage.setItem('userType', data.user.type);
            sessionStorage.setItem('userName', data.user.name);
            
            // Redirect based on user type
            if (data.user.type === 'admin') {
                window.location.href = '/pages/admin-portal.html';
            } else if (data.user.type === 'osa') {
                window.location.href = '/pages/osa-portal.html';
            } else {
                window.location.href = '/pages/org-portal.html';
            }
        } else {
            alert(data.message || 'Invalid credentials');
        }
    })
    .catch(err => {
        alert('Login failed. Please try again.');
        console.error(err);
    });
    
    return false;
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/index.html';
    }
}

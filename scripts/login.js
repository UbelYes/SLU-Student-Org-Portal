// Ensure fetch responses are not cached by default
/*
 * Small runtime helper: wrap window.fetch to default to `cache: 'no-store'`
 * - This prevents accidental cache hits for API requests in browsers.
 * - Individual fetch calls can still override `cache` if needed.
 */
(function(){
    if (typeof window === 'undefined' || !window.fetch) return;
    const _fetch = window.fetch.bind(window);
    window.fetch = function(input, init){ init = init || {}; if (!('cache' in init)) init.cache = 'no-store'; return _fetch(input, init); };
})();

/*
 * handleLogin(event)
 * - Prevents the default form submit
 * - Reads email/password from inputs
 * - Calls `/api/login.php` (POST JSON)
 * - On success: stores small UI state in sessionStorage and redirects to the appropriate portal
 */
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Please enter both email and password');
        return false;
    }

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
            if (data.user.type === 'osa') {
                window.location.href = '/pages/osa-portal.html';
            } else if (data.user.type === 'org') {
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



function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) return alert('Please enter both email and password');

    fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({email, password})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Object.entries({userEmail: data.user.email, userType: data.user.type, userName: data.user.name})
                .forEach(([k, v]) => sessionStorage.setItem(k, v));
            window.location.href = 'admin-portal.html';
        } else {
            alert(data.message || 'Invalid credentials');
        }
    })
    .catch(() => alert('Login failed'));
}

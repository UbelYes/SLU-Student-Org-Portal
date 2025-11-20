// ADMIN PORTAL - COMBINED SCRIPTS

// Check authentication with server session
fetch('/api/logout.php')
    .then(res => res.json())
    .then(data => {
        if (!data.logged_in || data.user.type !== 'admin') {
            window.location.href = '/index.html';
        } else {
            sessionStorage.setItem('userEmail', data.user.email);
            sessionStorage.setItem('userType', data.user.type);
            sessionStorage.setItem('userName', data.user.name);
        }
    })
    .catch(() => window.location.href = '/index.html');

// NAVIGATION & LOGOUT
function handleLogout() {
    fetch('/api/logout.php', { method: 'POST' })
        .then(() => {
            sessionStorage.clear();
            window.location.href = '/index.html';
        });
}

// DASHBOARD INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin dashboard loaded');
    loadAccounts();
    setInterval(loadAccounts, 3000); // Refresh every 3 seconds
});

// Load all accounts
function loadAccounts() {
    fetch('/api/logout.php?accounts=1')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.accounts) {
                displayAccounts(data.accounts);
                updateStats(data.accounts);
            }
        })
        .catch(err => console.error('Error loading accounts:', err));
}

// Display accounts
function displayAccounts(accounts) {
    const tbody = document.getElementById('online-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = accounts.map(account => {
        const type = account.user_type === 'admin' ? 'Admin' : account.user_type === 'osa' ? 'OSA Staff' : 'Organization';
        const lastActivity = account.last_activity ? new Date(account.last_activity).toLocaleString() : 'N/A';
        const statusClass = account.status === 'online' ? 'online' : 'status-offline';
        const statusText = account.status === 'online' ? 'Online' : 'Offline';
        
        return `<tr>
            <td>${type}</td>
            <td>${account.name || 'N/A'}</td>
            <td>${account.email}</td>
            <td>${lastActivity}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        </tr>`;
    }).join('');
}

// Update stats
function updateStats(accounts) {
    const onlineAccounts = accounts.filter(a => a.status === 'online');
    const orgCount = onlineAccounts.filter(a => a.user_type === 'org').length;
    const osaCount = onlineAccounts.filter(a => a.user_type === 'osa').length;
    
    if (document.getElementById('online-orgs')) document.getElementById('online-orgs').textContent = orgCount;
    if (document.getElementById('online-osa')) document.getElementById('online-osa').textContent = osaCount;
    if (document.getElementById('total-users')) document.getElementById('total-users').textContent = accounts.length;
}

// Refresh data
function refreshData() {
    loadAccounts();
}

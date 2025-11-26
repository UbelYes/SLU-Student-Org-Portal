// Check session
fetch('/api/admin/session', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
        if (!data.logged_in || data.user.type !== 'admin') return window.location.href = 'admin-login.html';
        Object.entries({userEmail: data.user.email, userType: data.user.type, userName: data.user.name})
            .forEach(([k, v]) => sessionStorage.setItem(k, v));
    })
    .catch(() => window.location.href = 'admin-login.html');

function handleLogout() {
    fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
        .then(() => {
            sessionStorage.clear();
            window.location.href = 'admin-login.html';
        });
}

// DASHBOARD INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
    setInterval(loadAccounts, 10000);
});

// Load accounts
function loadAccounts() {
    fetch('/api/admin/accounts', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.accounts) {
                displayAccounts(data.accounts);
                updateStats(data.accounts);
            }
        });
}

// Display accounts
function displayAccounts(accounts) {
    const tbody = document.getElementById('online-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = accounts.map(account => {
        const type = account.user_type === 'admin' ? 'Admin' : account.user_type === 'osa' ? 'OSA' : 'Organization';
        const lastActivity = account.last_activity ? new Date(account.last_activity).toLocaleString() : 'Never';
        const isOnline = account.status == 1;
        const statusClass = isOnline ? 'online' : 'status-offline';
        const statusText = isOnline ? 'Online' : 'Offline';
        
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
    const online = accounts.filter(a => a.status == 1);
    document.getElementById('online-orgs').textContent = online.filter(a => a.user_type === 'org').length;
    document.getElementById('online-osa').textContent = online.filter(a => a.user_type === 'osa').length;
    document.getElementById('total-users').textContent = accounts.length;
}

// Refresh data
function refreshData() {
    loadAccounts();
}

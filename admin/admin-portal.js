/*
 * Admin session check
 * - Calls the server-side `/api/admin/session` endpoint to verify the session cookie.
 * - Uses `credentials: 'include'` so the browser sends the session cookie.
 * - If session is invalid or the user is not an admin, replace the page with the login page.
 * - On success, store a few user fields in sessionStorage for UI use.
 */
function checkAdminAuth() {
    return fetch('/api/admin/session', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (!data.logged_in || data.user.type !== 'admin') {
                // Replace current history entry with login so Back won't return here
                window.location.replace('admin-login.html');
                return false;
            }
            // Persist small UI values client-side (not used for auth enforcement)
            Object.entries({userEmail: data.user.email, userType: data.user.type, userName: data.user.name})
                .forEach(([k, v]) => sessionStorage.setItem(k, v));
            return true;
        })
        .catch(() => { window.location.replace('admin-login.html'); return false; });
}

// Run initial check on load and also re-check when page is restored from the bfcache
checkAdminAuth();
window.addEventListener('pageshow', (event) => { if (event.persisted) checkAdminAuth(); });

/*
 * Logout
 * - POSTs to the admin logout endpoint (server should clear session)
 * - Clears client-side sessionStorage and uses `location.replace` to prevent Back navigation
 */
function handleLogout() {
    fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
        .then(() => {
            // Remove any UI-level session data
            sessionStorage.clear();
            // Use replace so the dashboard is not kept in history
            window.location.replace('admin-login.html');
        })
        .catch(() => window.location.replace('admin-login.html'));
}

// --------------------------
// Dashboard initialization
// --------------------------
// On DOMContentLoaded we load account data and set a polling interval to refresh it
document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
    setInterval(loadAccounts, 10000);
});

/*
 * Load accounts from server
 * - Calls `/api/admin/accounts` to get a list of users and their online status
 * - On success, updates the table and dashboard stats
 */
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

/*
 * Render accounts table
 * - Builds table rows from the `accounts` array returned by the server
 * - Formats last activity and online/offline status for display
 */
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

// Update dashboard statistics (counts shown on the page)
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

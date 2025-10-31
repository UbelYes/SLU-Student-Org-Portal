// Admin Dashboard - User Activity Monitoring (SQL-based)

let organizations = [];
let osaStaff = [];
let onlineUsers = [];
let stats = {
    online_orgs: 0,
    online_staff: 0,
    total_users: 0
};

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    startAutoRefresh();
});

async function initializeDashboard() {
    await loadDataFromServer();
    displayAllData();
    updateQuickStats();
}

async function loadDataFromServer() {
    try {
        const response = await fetch('../api/get-online-users.php', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            organizations = data.organizations || [];
            osaStaff = data.osa_staff || [];
            onlineUsers = data.online_users || [];
            stats = data.stats || { online_orgs: 0, online_staff: 0, total_users: 0 };
            
            console.log('Data loaded from server:', {
                organizations: organizations.length,
                staff: osaStaff.length,
                online: onlineUsers.length
            });
        } else {
            console.error('Failed to load data:', data.message);
            showError('Failed to load user data');
        }
    } catch (error) {
        console.error('Error loading data from server:', error);
        showError('Unable to connect to server. Please check your connection.');
    }
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Search inputs
    const onlineSearch = document.getElementById('online-search');
    const orgSearch = document.getElementById('org-search');
    const staffSearch = document.getElementById('staff-search');

    if (onlineSearch) onlineSearch.addEventListener('input', displayOnlineData);
    if (orgSearch) orgSearch.addEventListener('input', displayOrgData);
    if (staffSearch) staffSearch.addEventListener('input', displayStaffData);
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function displayAllData() {
    displayOnlineData();
    displayOrgData();
    displayStaffData();
}

function displayOnlineData() {
    const tbody = document.getElementById('online-table-body');
    const searchTerm = document.getElementById('online-search')?.value.toLowerCase() || '';

    if (!tbody) return;

    const filtered = onlineUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.type.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users currently online</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(user => `
        <tr>
            <td><span class="type-badge type-${user.type.toLowerCase().replace(' ', '-')}">${user.type}</span></td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${formatDateTime(user.last_activity)}</td>
            <td><span class="status-badge status-online">Online</span></td>
        </tr>
    `).join('');

    document.getElementById('online-count').textContent = filtered.length;
}

function displayOrgData() {
    const tbody = document.getElementById('org-table-body');
    const searchTerm = document.getElementById('org-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('org-status-filter')?.value || 'all';

    if (!tbody) return;

    const filtered = organizations.filter(org => {
        const matchesSearch = org.org_name.toLowerCase().includes(searchTerm) ||
            org.username.toLowerCase().includes(searchTerm) ||
            org.email.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No organizations found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(org => {
        const isOnline = org.online_status === 'online';
        return `
            <tr>
                <td><strong>${org.org_name}</strong></td>
                <td>${org.username}</td>
                <td>${org.email}</td>
                <td>${org.last_login ? formatDateTime(org.last_login) : 'Never'}</td>
                <td><span class="status-badge ${isOnline ? 'status-online' : 'status-offline'}">${isOnline ? 'Online' : 'Offline'}</span></td>
            </tr>
        `;
    }).join('');

    document.getElementById('org-count').textContent = organizations.length;
}

function displayStaffData() {
    const tbody = document.getElementById('staff-table-body');
    const searchTerm = document.getElementById('staff-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('staff-status-filter')?.value || 'all';

    if (!tbody) return;

    const filtered = osaStaff.filter(staff => {
        const matchesSearch = staff.username.toLowerCase().includes(searchTerm) ||
            staff.email.toLowerCase().includes(searchTerm) ||
            staff.role.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No staff members found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(staff => {
        const isOnline = staff.online_status === 'online';
        return `
            <tr>
                <td><strong>${staff.username}</strong></td>
                <td>${staff.email}</td>
                <td>${staff.role.replace('_', ' ').toUpperCase()}</td>
                <td>${staff.last_login ? formatDateTime(staff.last_login) : 'Never'}</td>
                <td><span class="status-badge ${isOnline ? 'status-online' : 'status-offline'}">${isOnline ? 'Online' : 'Offline'}</span></td>
            </tr>
        `;
    }).join('');

    document.getElementById('staff-count').textContent = osaStaff.length;
}

function updateQuickStats() {
    document.getElementById('online-orgs').textContent = stats.online_orgs || 0;
    document.getElementById('online-osa').textContent = stats.online_staff || 0;
    document.getElementById('total-users').textContent = stats.total_users || 0;
}

function formatDateTime(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));

    if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function refreshData() {
    await loadDataFromServer();
    displayAllData();
    updateQuickStats();
    
    // Show feedback
    const btn = event?.target;
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Refreshed!';
        btn.style.background = '#10b981';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);
    }
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: #fee2e2;
        color: #991b1b;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        font-family: "Arimo", sans-serif;
        font-size: 14px;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function startAutoRefresh() {
    // Auto-refresh every 30 seconds
    setInterval(async () => {
        await loadDataFromServer();
        displayAllData();
        updateQuickStats();
    }, 30000);
}

// Admin Dashboard - User Activity Monitoring

const STORAGE_KEYS = {
    ORGANIZATIONS: 'organizations',
    OSA_STAFF: 'osaStaff',
    ONLINE_USERS: 'onlineUsers',
    LAST_ACTIVITY: 'lastActivity'
};

const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

let organizations = [];
let osaStaff = [];
let onlineUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    startAutoRefresh();
});

function initializeDashboard() {
    loadSampleData();
    loadData();
    displayAllData();
    updateQuickStats();
}

function loadSampleData() {
    // Initialize sample data if not exists
    if (!localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS)) {
        const sampleOrgs = [
            { id: 1, org_name: 'SAMCIS', username: 'samcis', email: 'samcis@slu.edu.ph', status: 'active', last_login: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
            { id: 2, org_name: 'ICON', username: 'icon', email: 'icon@slu.edu.ph', status: 'active', last_login: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
            { id: 3, org_name: 'Student Council', username: 'student', email: 'student@slu.edu.ph', status: 'active', last_login: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
            { id: 4, org_name: 'ENGSO', username: 'engso', email: 'engso@slu.edu.ph', status: 'active', last_login: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
            { id: 5, org_name: 'NSTP', username: 'nstp', email: 'nstp@slu.edu.ph', status: 'active', last_login: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
        ];
        localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(sampleOrgs));
    }

    if (!localStorage.getItem(STORAGE_KEYS.OSA_STAFF)) {
        const sampleStaff = [
            { id: 1, username: 'osa_admin', email: 'osa@slu.edu.ph', role: 'osa_admin', status: 'active', last_login: new Date(Date.now() - 1 * 60 * 1000).toISOString() },
            { id: 2, username: 'staff1', email: 'staff1@slu.edu.ph', role: 'osa_admin', status: 'active', last_login: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
            { id: 3, username: 'staff2', email: 'staff2@slu.edu.ph', role: 'osa_admin', status: 'active', last_login: new Date(Date.now() - 15 * 60 * 1000).toISOString() }
        ];
        localStorage.setItem(STORAGE_KEYS.OSA_STAFF, JSON.stringify(sampleStaff));
    }
}

function loadData() {
    organizations = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS) || '[]');
    osaStaff = JSON.parse(localStorage.getItem(STORAGE_KEYS.OSA_STAFF) || '[]');
    updateOnlineUsers();
}

function updateOnlineUsers() {
    const now = Date.now();
    onlineUsers = [];

    // Check online organizations
    organizations.forEach(org => {
        if (org.last_login) {
            const lastActivity = new Date(org.last_login).getTime();
            if (now - lastActivity < ONLINE_THRESHOLD) {
                onlineUsers.push({
                    type: 'Organization',
                    name: org.org_name,
                    email: org.email,
                    last_activity: org.last_login,
                    status: 'online'
                });
            }
        }
    });

    // Check online OSA staff
    osaStaff.forEach(staff => {
        if (staff.last_login) {
            const lastActivity = new Date(staff.last_login).getTime();
            if (now - lastActivity < ONLINE_THRESHOLD) {
                onlineUsers.push({
                    type: 'OSA Staff',
                    name: staff.username,
                    email: staff.email,
                    last_activity: staff.last_login,
                    status: 'online'
                });
            }
        }
    });

    // Sort by most recent activity
    onlineUsers.sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity));
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
    }).sort((a, b) => {
        // Sort by last login, most recent first
        if (!a.last_login) return 1;
        if (!b.last_login) return -1;
        return new Date(b.last_login) - new Date(a.last_login);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No organizations found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(org => {
        const isOnline = org.last_login && (Date.now() - new Date(org.last_login).getTime() < ONLINE_THRESHOLD);
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
    }).sort((a, b) => {
        // Sort by last login, most recent first
        if (!a.last_login) return 1;
        if (!b.last_login) return -1;
        return new Date(b.last_login) - new Date(a.last_login);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No staff members found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(staff => {
        const isOnline = staff.last_login && (Date.now() - new Date(staff.last_login).getTime() < ONLINE_THRESHOLD);
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
    const onlineOrgs = organizations.filter(org => 
        org.last_login && (Date.now() - new Date(org.last_login).getTime() < ONLINE_THRESHOLD)
    ).length;

    const onlineStaff = osaStaff.filter(staff => 
        staff.last_login && (Date.now() - new Date(staff.last_login).getTime() < ONLINE_THRESHOLD)
    ).length;

    const totalUsers = organizations.length + osaStaff.length;

    document.getElementById('online-orgs').textContent = onlineOrgs;
    document.getElementById('online-osa').textContent = onlineStaff;
    document.getElementById('total-users').textContent = totalUsers;
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

function refreshData() {
    loadData();
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

function startAutoRefresh() {
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadData();
        displayAllData();
        updateQuickStats();
    }, 30000);
}

// Simulate user activity for demo purposes
function simulateUserActivity() {
    if (organizations.length > 0) {
        const randomOrg = organizations[Math.floor(Math.random() * organizations.length)];
        randomOrg.last_login = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(organizations));
    }

    if (osaStaff.length > 0) {
        const randomStaff = osaStaff[Math.floor(Math.random() * osaStaff.length)];
        randomStaff.last_login = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.OSA_STAFF, JSON.stringify(osaStaff));
    }

    refreshData();
}

// Track current user activity
function trackUserActivity() {
    const userType = localStorage.getItem('userType');
    const userId = localStorage.getItem('userId');

    if (userType && userId) {
        const activityData = {
            userId: userId,
            userType: userType,
            timestamp: new Date().toISOString()
        };

        // Update last_login in appropriate storage
        if (userType === 'organization') {
            const org = organizations.find(o => o.id === parseInt(userId));
            if (org) {
                org.last_login = activityData.timestamp;
                localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(organizations));
            }
        } else if (userType === 'osa_staff') {
            const staff = osaStaff.find(s => s.id === parseInt(userId));
            if (staff) {
                staff.last_login = activityData.timestamp;
                localStorage.setItem(STORAGE_KEYS.OSA_STAFF, JSON.stringify(osaStaff));
            }
        }
    }
}

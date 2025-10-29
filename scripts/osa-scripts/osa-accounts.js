/**
 * OSA Accounts - Student Activity Tracking
 * Tracks student access and form submissions
 */

// Storage keys
const STORAGE_KEYS = {
    ACCESS_LOG: 'studentAccessLog',
    FORM_SUBMISSIONS: 'formSubmissions'
};

// Initialize data structures
let accessLog = [];
let formSubmissions = [];

/**
 * Initialize the page
 */
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    displayAccessData();
    displaySubmissionData();
    updateCounts();
});

/**
 * Load data from localStorage
 */
function loadData() {
    const accessData = localStorage.getItem(STORAGE_KEYS.ACCESS_LOG);
    const submissionData = localStorage.getItem(STORAGE_KEYS.FORM_SUBMISSIONS);
    
    accessLog = accessData ? JSON.parse(accessData) : [];
    formSubmissions = submissionData ? JSON.parse(submissionData) : generateSampleSubmissions();
    
    // If no access log exists, generate sample data
    if (accessLog.length === 0) {
        accessLog = generateSampleAccessLog();
        saveAccessLog();
    }
    
    // Save submissions if they were just generated
    if (!submissionData) {
        saveFormSubmissions();
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    // Search filters
    const accessSearch = document.getElementById('access-search');
    const submissionSearch = document.getElementById('submission-search');
    
    if (accessSearch) {
        accessSearch.addEventListener('input', debounce(displayAccessData, 300));
    }
    
    if (submissionSearch) {
        submissionSearch.addEventListener('input', debounce(displaySubmissionData, 300));
    }
    
    // Time filters
    const accessTimeFilter = document.getElementById('access-time-filter');
    const submissionTimeFilter = document.getElementById('submission-time-filter');
    const submissionStatusFilter = document.getElementById('submission-status-filter');
    
    if (accessTimeFilter) {
        accessTimeFilter.addEventListener('change', displayAccessData);
    }
    
    if (submissionTimeFilter) {
        submissionTimeFilter.addEventListener('change', displaySubmissionData);
    }
    
    if (submissionStatusFilter) {
        submissionStatusFilter.addEventListener('change', displaySubmissionData);
    }
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

/**
 * Display access data
 */
function displayAccessData() {
    const tbody = document.getElementById('access-table-body');
    const searchTerm = document.getElementById('access-search')?.value.toLowerCase() || '';
    const timeFilter = document.getElementById('access-time-filter')?.value || 'all';
    
    if (!tbody) return;
    
    // Filter data
    let filteredData = accessLog.filter(entry => {
        const matchesSearch = 
            entry.orgName.toLowerCase().includes(searchTerm) ||
            entry.studentName.toLowerCase().includes(searchTerm) ||
            entry.email.toLowerCase().includes(searchTerm);
        
        const matchesTime = filterByTime(new Date(entry.lastAccess), timeFilter);
        
        return matchesSearch && matchesTime;
    });
    
    // Sort by most recent
    filteredData.sort((a, b) => new Date(b.lastAccess) - new Date(a.lastAccess));
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No access records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredData.map(entry => `
        <tr>
            <td><strong>${escapeHtml(entry.orgName)}</strong></td>
            <td>${escapeHtml(entry.studentName)}</td>
            <td>${escapeHtml(entry.email)}</td>
            <td>${formatDateTime(entry.lastAccess)}</td>
            <td>${entry.sessionCount}</td>
            <td><span class="status-badge ${getStatusClass(entry.lastAccess)}">${getStatusText(entry.lastAccess)}</span></td>
        </tr>
    `).join('');
}

/**
 * Display submission data
 */
function displaySubmissionData() {
    const tbody = document.getElementById('submission-table-body');
    const searchTerm = document.getElementById('submission-search')?.value.toLowerCase() || '';
    const timeFilter = document.getElementById('submission-time-filter')?.value || 'all';
    const statusFilter = document.getElementById('submission-status-filter')?.value || 'all';
    
    if (!tbody) return;
    
    // Filter data
    let filteredData = formSubmissions.filter(entry => {
        const matchesSearch = 
            entry.organization.toLowerCase().includes(searchTerm) ||
            entry.formType.toLowerCase().includes(searchTerm) ||
            entry.submittedBy.toLowerCase().includes(searchTerm);
        
        const matchesTime = filterByTime(new Date(entry.submissionDate), timeFilter);
        const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
        
        return matchesSearch && matchesTime && matchesStatus;
    });
    
    // Sort by most recent
    filteredData.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No form submissions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredData.map(entry => `
        <tr>
            <td><strong>${escapeHtml(entry.organization)}</strong></td>
            <td>${escapeHtml(entry.formType)}</td>
            <td>${escapeHtml(entry.submittedBy)}</td>
            <td>${formatDateTime(entry.submissionDate)}</td>
            <td><span class="status-badge status-${entry.status}">${capitalizeFirst(entry.status)}</span></td>
            <td>
                <button class="btn-view" onclick="viewSubmission('${entry.id}')">View</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Update badge counts
 */
function updateCounts() {
    const accessCount = document.getElementById('access-count');
    const submissionCount = document.getElementById('submission-count');
    
    if (accessCount) {
        accessCount.textContent = accessLog.length;
    }
    
    if (submissionCount) {
        const pendingCount = formSubmissions.filter(s => s.status === 'pending').length;
        submissionCount.textContent = pendingCount;
    }
}

/**
 * Refresh data
 */
function refreshAccessData() {
    loadData();
    displayAccessData();
    updateCounts();
    showNotification('Access data refreshed');
}

function refreshSubmissionData() {
    loadData();
    displaySubmissionData();
    updateCounts();
    showNotification('Submission data refreshed');
}

/**
 * View submission details
 */
function viewSubmission(id) {
    const submission = formSubmissions.find(s => s.id === id);
    if (!submission) return;
    
    alert(`Form Submission Details:\n\nOrganization: ${submission.organization}\nForm Type: ${submission.formType}\nSubmitted By: ${submission.submittedBy}\nDate: ${formatDateTime(submission.submissionDate)}\nStatus: ${capitalizeFirst(submission.status)}`);
}

/**
 * Track student access (called from login script)
 */
function trackStudentAccess(email, name, org) {
    const existingEntry = accessLog.find(entry => entry.email === email);
    
    if (existingEntry) {
        existingEntry.lastAccess = new Date().toISOString();
        existingEntry.sessionCount++;
    } else {
        accessLog.push({
            email: email,
            studentName: name,
            orgName: org,
            lastAccess: new Date().toISOString(),
            sessionCount: 1
        });
    }
    
    saveAccessLog();
}

/**
 * Save access log to localStorage
 */
function saveAccessLog() {
    localStorage.setItem(STORAGE_KEYS.ACCESS_LOG, JSON.stringify(accessLog));
}

/**
 * Save form submissions to localStorage
 */
function saveFormSubmissions() {
    localStorage.setItem(STORAGE_KEYS.FORM_SUBMISSIONS, JSON.stringify(formSubmissions));
}

/**
 * Generate sample access log
 */
function generateSampleAccessLog() {
    const now = new Date();
    return [
        {
            email: 'samcis@slu.edu.ph',
            studentName: 'Juan Dela Cruz',
            orgName: 'SAMCIS',
            lastAccess: new Date(now - 15 * 60 * 1000).toISOString(), // 15 min ago
            sessionCount: 12
        },
        {
            email: 'icon@slu.edu.ph',
            studentName: 'Maria Santos',
            orgName: 'ICON',
            lastAccess: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            sessionCount: 8
        },
        {
            email: 'student@slu.edu.ph',
            studentName: 'Pedro Reyes',
            orgName: 'Student Council',
            lastAccess: new Date(now - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
            sessionCount: 15
        },
        {
            email: 'engr.society@slu.edu.ph',
            studentName: 'Anna Garcia',
            orgName: 'Engineering Society',
            lastAccess: new Date(now - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            sessionCount: 5
        },
        {
            email: 'bizclub@slu.edu.ph',
            studentName: 'Carlos Mendoza',
            orgName: 'Business Club',
            lastAccess: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            sessionCount: 3
        }
    ];
}

/**
 * Generate sample form submissions
 */
function generateSampleSubmissions() {
    const now = new Date();
    return [
        {
            id: 'form-001',
            organization: 'SAMCIS',
            formType: 'Event Proposal',
            submittedBy: 'Juan Dela Cruz',
            submissionDate: new Date(now - 30 * 60 * 1000).toISOString(), // 30 min ago
            status: 'pending'
        },
        {
            id: 'form-002',
            organization: 'ICON',
            formType: 'Budget Request',
            submittedBy: 'Maria Santos',
            submissionDate: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            status: 'approved'
        },
        {
            id: 'form-003',
            organization: 'Student Council',
            formType: 'Activity Report',
            submittedBy: 'Pedro Reyes',
            submissionDate: new Date(now - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            status: 'pending'
        },
        {
            id: 'form-004',
            organization: 'Engineering Society',
            formType: 'Venue Request',
            submittedBy: 'Anna Garcia',
            submissionDate: new Date(now - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
            status: 'rejected'
        },
        {
            id: 'form-005',
            organization: 'Business Club',
            formType: 'Event Proposal',
            submittedBy: 'Carlos Mendoza',
            submissionDate: new Date(now - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            status: 'approved'
        }
    ];
}

/**
 * Utility functions
 */
function filterByTime(date, filter) {
    const now = new Date();
    const diff = now - date;
    
    switch (filter) {
        case 'today':
            return diff < 24 * 60 * 60 * 1000;
        case 'week':
            return diff < 7 * 24 * 60 * 60 * 1000;
        case 'month':
            return diff < 30 * 24 * 60 * 60 * 1000;
        default:
            return true;
    }
}

function getStatusClass(lastAccess) {
    const diff = new Date() - new Date(lastAccess);
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return 'status-online';
    if (hours < 24) return 'status-recent';
    return 'status-inactive';
}

function getStatusText(lastAccess) {
    const diff = new Date() - new Date(lastAccess);
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return 'Active';
    if (hours < 24) return 'Recent';
    return 'Inactive';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // If less than 1 hour ago, show minutes
    if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // If less than 24 hours ago, show hours
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message) {
    // Simple notification - could be enhanced with a toast component
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:15px 20px;border-radius:5px;z-index:1000;';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Expose function globally for login script
window.trackStudentAccess = trackStudentAccess;

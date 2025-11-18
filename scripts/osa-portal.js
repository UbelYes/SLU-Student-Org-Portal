// ============================================
// OSA PORTAL - COMBINED SCRIPTS
// ============================================

// ============================================
// NAVIGATION & LOGOUT
// ============================================
function handleLogout() { 
    window.location.href = '/index.html'; 
}

// ============================================
// FORMS MANAGEMENT
// ============================================
// Load submissions for OSA review
function loadSubmissions() {
    fetch('/api/read.php')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('.form-table tbody');
            if (data.success && data.records) {
                tbody.innerHTML = data.records.map(record => `
                    <tr>
                        <td>${escapeHtml(record.submission_title || '')}</td>
                        <td>${escapeHtml(record.org_name || '')}</td>
                        <td>${escapeHtml(record.applicant_name || '')}</td>
                        <td>${new Date(record.created_at).toLocaleDateString()}</td>
                        <td>Pending</td>
                        <td><button onclick="alert('View functionality')">View</button></td>
                    </tr>
                `).join('');
            }
        });
}

function refreshForms() {
    loadSubmissions();
}

// ============================================
// DOCUMENTS MANAGEMENT
// ============================================
function loadDocuments() {
    fetch('/api/read.php')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('documents-table-body');
            if (tbody && data.success && data.records) {
                tbody.innerHTML = data.records.map(record => `
                    <tr>
                        <td>${escapeHtml(record.org_name || 'Document')}</td>
                        <td>${escapeHtml(record.submission_title || '')}</td>
                        <td>${new Date(record.created_at).toLocaleDateString()}</td>
                        <td><button onclick="alert('View document')">View</button></td>
                    </tr>
                `).join('');
            }
        });
}

function refreshDocuments() {
    loadDocuments();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Load forms data
    loadSubmissions();
    // Load documents data
    loadDocuments();
});

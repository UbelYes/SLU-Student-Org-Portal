// Load submissions when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSubmissions();
    
    // Add event listener for search
    document.getElementById('searchInput')?.addEventListener('input', filterSubmissions);
    
    // Add event listener for status filter
    document.getElementById('statusFilter')?.addEventListener('change', filterSubmissions);
});

let allSubmissions = [];

// Load submissions from API
function loadSubmissions() {
    fetch('/api/get-submissions.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allSubmissions = data.submissions;
                displaySubmissions(allSubmissions);
            } else {
                showEmptyState();
            }
        })
        .catch(error => {
            console.error('Error loading submissions:', error);
            showError('Failed to load submissions. Please try again later.');
        });
}

// Display submissions in table
function displaySubmissions(submissions) {
    const tbody = document.querySelector('.submissions-table tbody');
    
    if (submissions.length === 0) {
        showEmptyState();
        return;
    }
    
    tbody.innerHTML = '';
    
    submissions.forEach(submission => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="title-cell">
                <div class="form-title">${escapeHtml(submission.submission_title)}</div>
                <div class="form-subtitle">${escapeHtml(submission.org_acronym)}</div>
            </td>
            <td>${formatDate(submission.submitted_date)}</td>
            <td><span class="status-badge ${submission.status}">${capitalizeFirst(submission.status)}</span></td>
            <td>v1</td>
            <td class="feedback-cell">${submission.status === 'submitted' ? 'Pending review' : 'No feedback'}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewSubmission(${submission.id})">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    hideEmptyState();
}

// Filter submissions based on search and status
function filterSubmissions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = allSubmissions.filter(submission => {
        const matchesSearch = submission.submission_title.toLowerCase().includes(searchTerm) ||
                            submission.org_acronym.toLowerCase().includes(searchTerm) ||
                            submission.org_full_name.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || submission.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displaySubmissions(filtered);
}

// View submission details
function viewSubmission(id) {
    const submission = allSubmissions.find(s => s.id == id);
    if (!submission) {
        alert('Submission not found');
        return;
    }
    
    // Update modal with submission data
    document.getElementById('modalFormTitle').textContent = submission.submission_title;
    document.getElementById('modalSubmittedDate').textContent = formatDate(submission.submitted_date);
    document.getElementById('modalStatus').textContent = capitalizeFirst(submission.status);
    document.getElementById('modalStatus').className = 'status-badge ' + submission.status;
    document.getElementById('modalVersion').textContent = 'v1';
    document.getElementById('modalFeedback').textContent = submission.status === 'submitted' ? 'Pending review' : 'No feedback';
    
    // Update form content in modal
    updateModalContent(submission);
    
    // Show modal
    document.getElementById('viewModal').style.display = 'block';
}

// Update modal content with submission details
function updateModalContent(submission) {
    // This is a simplified version - you would update all fields in the modal
    const modalBody = document.querySelector('.modal-body .form-view-container');
    
    modalBody.innerHTML = `
        <h3>Submission Information</h3>
        
        <div class="view-section">
            <h4>Organization Information</h4>
            <div class="view-field">
                <label>Complete Name of Organization:</label>
                <div class="field-value">${escapeHtml(submission.org_full_name)}</div>
            </div>
            <div class="view-field">
                <label>Acronym:</label>
                <div class="field-value">${escapeHtml(submission.org_acronym)}</div>
            </div>
            <div class="view-field">
                <label>Official SLU Institutional Email:</label>
                <div class="field-value">${escapeHtml(submission.org_email)}</div>
            </div>
            <div class="view-field">
                <label>Social Media Pages:</label>
                <div class="field-value">${escapeHtml(submission.social_media_links || 'N/A')}</div>
            </div>
        </div>

        <div class="view-section">
            <h4>Applicant Information</h4>
            <div class="view-field">
                <label>Name of Applicant:</label>
                <div class="field-value">${escapeHtml(submission.applicant_name)}</div>
            </div>
            <div class="view-field">
                <label>Position:</label>
                <div class="field-value">${escapeHtml(submission.applicant_position)}</div>
            </div>
            <div class="view-field">
                <label>Applicant's Email:</label>
                <div class="field-value">${escapeHtml(submission.applicant_email)}</div>
            </div>
        </div>

        <div class="view-section">
            <h4>Adviser Information</h4>
            <div class="view-field">
                <label>Name of Adviser/s:</label>
                <div class="field-value">${escapeHtml(submission.adviser_names)}</div>
            </div>
            <div class="view-field">
                <label>Adviser Email/s:</label>
                <div class="field-value">${escapeHtml(submission.adviser_emails)}</div>
            </div>
        </div>

        <div class="view-section">
            <h4>Category & Type</h4>
            <div class="view-field">
                <label>Category:</label>
                <div class="field-value">${escapeHtml(submission.category)}</div>
            </div>
            <div class="view-field">
                <label>Type of Organization:</label>
                <div class="field-value">${capitalizeFirst(submission.org_type)}</div>
            </div>
        </div>

        <div class="view-section">
            <h4>Additional Information</h4>
            <div class="view-field">
                <label>CBL Status:</label>
                <div class="field-value">${capitalizeFirst(submission.cbl_status)}</div>
            </div>
            <div class="view-field">
                <label>Video Link:</label>
                <div class="field-value"><a href="${escapeHtml(submission.video_link)}" target="_blank">${escapeHtml(submission.video_link)}</a></div>
            </div>
        </div>
    `;
}

// Close modal
function closeModal() {
    document.getElementById('viewModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('viewModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Show empty state
function showEmptyState() {
    const tbody = document.querySelector('.submissions-table tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="empty-state" style="display: block; padding: 40px;">
                    <div class="empty-icon" style="font-size: 48px;">📋</div>
                    <h3>No Submissions Yet</h3>
                    <p>You haven't submitted any forms yet. Start by filling out a form.</p>
                    <a href="/org/org-form.html" class="btn-primary" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Fill Out Form</a>
                </div>
            </td>
        </tr>
    `;
}

// Hide empty state
function hideEmptyState() {
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    const tbody = document.querySelector('.submissions-table tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center" style="padding: 40px; color: #d9534f;">
                <p>${escapeHtml(message)}</p>
                <button onclick="loadSubmissions()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
            </td>
        </tr>
    `;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

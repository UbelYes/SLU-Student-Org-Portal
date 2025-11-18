// ============================================
// ORG PORTAL - COMBINED SCRIPTS
// ============================================

// ============================================
// NAVIGATION & LOGOUT
// ============================================
function handleLogout() { 
    window.location.href = '/index.html'; 
}

// ============================================
// HAMBURGER MENU
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    // Load submissions when page loads
    loadSubmissions();
});

// ============================================
// FORM SUBMISSION
// ============================================
function submitForm(event) {
    event.preventDefault();
    
    const formData = {
        org_name: document.getElementById('org_full_name')?.value || '',
        submission_title: document.getElementById('submission_title')?.value || '',
        applicant_name: document.getElementById('applicant_name')?.value || ''
    };

    fetch('/api/write.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Form submitted successfully!');
            // Reload submissions and switch to submissions tab
            loadSubmissions();
            showTab('submissions');
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(() => alert('Failed to submit form'));
}

function clearForm() {
    if (confirm('Clear all form data?')) {
        document.getElementById('orgSubmissionForm').reset();
    }
}

// ============================================
// SUBMISSIONS DISPLAY
// ============================================
function loadSubmissions() {
    fetch('/api/read.php')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('.submissions-table tbody');
            if (data.success && data.records) {
                tbody.innerHTML = data.records.map(record => `
                    <tr>
                        <td>${escapeHtml(record.org_name || '')}</td>
                        <td>${escapeHtml(record.submission_title || '')}</td>
                        <td>${escapeHtml(record.applicant_name || '')}</td>
                        <td>${new Date(record.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            }
        })
        .catch(() => console.error('Failed to load submissions'));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

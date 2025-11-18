// NAVIGATION & LOGOUT
function handleLogout() { 
    window.location.href = '/index.html'; 
}

// HAMBURGER MENU
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

// FORM SUBMISSION
function submitForm(event) {
    event.preventDefault();
    
    /*
    Collect the data from the html and by get element since most of the inputs are 
    given IDs idk about class. For checkboxes and other selects, turn them into arrays first
    and iterate through them. Brackets are to show php its an array. 
    */
    const formData = {
        submission_title: document.getElementById('submission_title')?.value || '',
        org_name: document.getElementById('org_full_name')?.value || '',
        org_acronym: document.getElementById('org_acronym')?.value || '',
        org_email: document.getElementById('org_email')?.value || '',
        social_media: document.getElementById('social_media_links')?.value || '',
        applicant_name: document.getElementById('applicant_name')?.value || '',
        applicant_position: document.getElementById('applicant_position')?.value || '',
        applicant_email: document.getElementById('applicant_email')?.value || '',
        adviser_names: document.getElementById('adviser_names')?.value || '',
        adviser_emails: document.getElementById('adviser_emails')?.value || '',
        organization_school: Array.from(document.querySelectorAll('input[name="category"]:checked')).map(checkbox => checkbox.value|| ''),
        organization_type: document.querySelector('input[name="org_type"]:checked')?.value || '',

        events: Array.from(document.querySelectorAll('.event-section')).map(event => ({
        name: event.querySelector('[name="event_name[]"]').value || '',
        date: event.querySelector('[name="event_date[]"]').value || '',
        venue: event.querySelector('[name="event_venue[]"]').value || '',
        description: event.querySelector('[name="event_description[]"]').value || '',
        participants: event.querySelector('[name="event_participants[]"]').value || '',
        budget: event.querySelector('[name="event_budget[]"]').value || ''
    }))
    };

    fetch('/api/submit.php', {
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

// SUBMISSIONS DISPLAY
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

// DYNAMIC EVENT MANAGEMENT
function addEvent() {
    const container = document.querySelector('.event-section');
    const newEvent = document.createElement('div');
    newEvent.className = 'event-item';
    newEvent.innerHTML = `
        <hr style="margin: 20px 0; border: none; border-top: 2px solid #ddd;">
        <div class="form-group">
            <label class="form-label form-label--required">Name of the Event</label>
            <input type="text" class="form-input" name="event_name[]" required placeholder="e.g. Annual General Assembly, Fundraising Drive">
        </div>
        <div class="form-group">
            <label class="form-label form-label--required">Event Date</label>
            <input type="date" class="form-input" name="event_date[]" required>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required">Event Venue</label>
            <input type="text" class="form-input" name="event_venue[]" required placeholder="e.g. Main Auditorium, Conference Room">
        </div>
        <div class="form-group">
            <label class="form-label form-label--required">Event Description</label>
            <textarea class="form-input" name="event_description[]" required placeholder="Provide a brief description of the event"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label form-label--required">Expected Number of Participants</label>
            <input type="number" class="form-input" name="event_participants[]" required placeholder="e.g. 50, 100">
        </div>
        <div class="form-group">
            <label class="form-label form-label--required">Budget Estimate (PHP)</label>
            <input type="number" class="form-input" name="event_budget[]" required placeholder="e.g. 5000, 10000">
        </div>
        <button type="button" class="btn btn--danger" onclick="this.parentElement.remove()" style="margin-top: 10px;">Remove Event</button>
    `;
    
    // Insert before the "Add Another Event" button
    const addButton = container.querySelector('.event-actions');
    container.insertBefore(newEvent, addButton);
}

// UTILITY FUNCTIONS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

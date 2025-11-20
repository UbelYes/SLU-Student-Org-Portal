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
    displayUserInfo();
});

function displayUserInfo() {
    const userName = sessionStorage.getItem('userName') || 'User';
    document.getElementById('user-name').textContent = userName;
}

// FORM SUBMISSION
function submitForm(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('submission_title', document.getElementById('submission_title')?.value || '');
    formData.append('org_name', document.getElementById('org_full_name')?.value || '');
    formData.append('org_acronym', document.getElementById('org_acronym')?.value || '');
    formData.append('org_email', document.getElementById('org_email')?.value || '');
    formData.append('social_media', document.getElementById('social_media_links')?.value || '');
    formData.append('applicant_name', document.getElementById('applicant_name')?.value || '');
    formData.append('applicant_position', document.getElementById('applicant_position')?.value || '');
    formData.append('applicant_email', document.getElementById('applicant_email')?.value || '');
    formData.append('adviser_names', document.getElementById('adviser_names')?.value || '');
    formData.append('adviser_emails', document.getElementById('adviser_emails')?.value || '');
    formData.append('organization_school', Array.from(document.querySelectorAll('input[name="category"]:checked')).map(c => c.value).join(','));
    formData.append('organization_type', document.querySelector('input[name="org_type"]:checked')?.value || '');
    
    const events = Array.from(document.querySelectorAll('.event-section')).map(event => ({
        name: event.querySelector('[name="event_name[]"]').value || '',
        date: event.querySelector('[name="event_date[]"]').value || '',
        venue: event.querySelector('[name="event_venue[]"]').value || '',
        description: event.querySelector('[name="event_description[]"]').value || '',
        participants: event.querySelector('[name="event_participants[]"]').value || '',
        budget: event.querySelector('[name="event_budget[]"]').value || ''
    }));
    formData.append('events', JSON.stringify(events));
    
    const fileInput = document.getElementById('uploaded_file');
    if (fileInput?.files[0]) formData.append('file', fileInput.files[0]);

    fetch('/api/submit.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Form submitted successfully!');
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
let allRecords = [];

function loadSubmissions() {
    fetch('/api/read.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.records) {
                allRecords = data.records;
                displayRecords(data.records);
            }
        })
        .catch(() => console.error('Failed to load submissions'));
}

function displayRecords(records) {
    const tbody = document.querySelector('.submissions-table tbody');
    tbody.innerHTML = records.map(record => `
        <tr>
            <td>${record.org_name || ''}</td>
            <td>${record.submission_title || ''}</td>
            <td>${record.applicant_name || ''}</td>
            <td>${record.created_at}</td>
            <td>
                <button onclick="viewPDF(${record.id})" style="padding:5px 10px;margin-right:5px;background:#004080;color:white;border:none;border-radius:4px;cursor:pointer">View</button>
            </td>
        </tr>
    `).join('');
}

// DYNAMIC EVENT MANAGEMENT
/*
This is to add more events using DOM
 */
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

// PDF FUNCTIONS
/*
To view the files we'll just use straight pdf rather than a modal to save some space.
 */
function viewPDF(id) {
    fetch(`/api/read.php?id=${id}`)
        .then(r => r.json())
        .then(data => {
            if (data.success && data.record) {
                const win = window.open('', '_blank');
                win.document.write(generatePDFHTML(data.record));
                win.document.close();
                win.print();
            }
        });
}

// This makes the pdf (prolly gonna duplicate to osa-portal.js)
function generatePDFHTML(record) {
    const events = record.events_json ? JSON.parse(record.events_json) : [];
    const eventsHTML = events.map((e, i) => `
        <div style="margin:15px 0;padding:10px;background:#f9f9f9;border-left:3px solid #004080">
            <div class="label">Event ${i + 1}: ${e.name || 'N/A'}</div>
            <div class="value">Date: ${e.date || 'N/A'} | Venue: ${e.venue || 'N/A'}</div>
            <div class="value">Participants: ${e.participants || 'N/A'} | Budget: ₱${e.budget || 'N/A'}</div>
            <div class="value">Description: ${e.description || 'N/A'}</div>
        </div>
    `).join('');
    
    return `<!DOCTYPE html>
<html><head><title>${record.submission_title}</title>
<style>
    body{font-family:Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto;line-height:1.6}
    h1{color:#004080;border-bottom:3px solid #004080;padding-bottom:10px;margin-bottom:20px}
    h2{color:#004080;margin-top:25px;border-bottom:1px solid #ddd;padding-bottom:5px}
    .label{font-weight:bold;color:#555;margin-top:10px}
    .value{margin:5px 0 10px 15px}
    @media print{body{padding:20px}}
</style></head><body>
<h1>${record.submission_title || 'Submission Form'}</h1>

<h2>Organization Information</h2>
<div class="label">Organization Name:</div><div class="value">${record.org_name || 'N/A'}</div>
<div class="label">Acronym:</div><div class="value">${record.org_acronym || 'N/A'}</div>
<div class="label">Email:</div><div class="value">${record.org_email || 'N/A'}</div>
<div class="label">Social Media:</div><div class="value">${record.social_media || 'N/A'}</div>
<div class="label">School:</div><div class="value">${record.organization_school || 'N/A'}</div>
<div class="label">Type:</div><div class="value">${record.organization_type || 'N/A'}</div>

<h2>Applicant Information</h2>
<div class="label">Name:</div><div class="value">${record.applicant_name || 'N/A'}</div>
<div class="label">Position:</div><div class="value">${record.applicant_position || 'N/A'}</div>
<div class="label">Email:</div><div class="value">${record.applicant_email || 'N/A'}</div>

<h2>Adviser Information</h2>
<div class="label">Name(s):</div><div class="value">${record.adviser_names || 'N/A'}</div>
<div class="label">Email(s):</div><div class="value">${record.adviser_emails || 'N/A'}</div>

<h2>Events</h2>
${eventsHTML || '<div class="value">No events listed</div>'}

<div style="margin-top:30px;padding-top:10px;border-top:1px solid #ddd;color:#777;font-size:12px">
    Submitted: ${record.created_at || 'N/A'}
</div>
</body></html>`;
}



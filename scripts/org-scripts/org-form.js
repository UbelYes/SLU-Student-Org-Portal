// Form submission handler
function submitForm(event) {
    event.preventDefault();
    
    // Get form element
    const form = document.getElementById('orgSubmissionForm');
    
    // Validate form
    if (!form.checkValidity()) {
        alert('Please fill in all required fields');
        form.reportValidity();
        return;
    }
    
    // Collect form data
    const formData = {
        submission_title: document.getElementById('submission_title').value,
        org_full_name: document.getElementById('org_full_name').value,
        org_acronym: document.getElementById('org_acronym').value,
        org_email: document.getElementById('org_email').value,
        social_media_links: document.getElementById('social_media_links').value || '',
        applicant_name: document.getElementById('applicant_name').value,
        applicant_position: document.getElementById('applicant_position').value,
        applicant_email: document.getElementById('applicant_email').value,
        adviser_names: document.getElementById('adviser_names').value,
        adviser_emails: document.getElementById('adviser_emails').value,
        category: getSelectedCategories(),
        org_type: document.querySelector('input[name="org_type"]:checked').value,
        cbl_status: document.querySelector('input[name="cbl_status"]:checked').value,
        video_link: document.getElementById('video_link').value
    };
    
    // Validate at least one category is selected
    if (!formData.category) {
        alert('Please select at least one category');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Submit form via AJAX
    fetch('/api/submit-form.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Form submitted successfully!');
            // Clear form
            form.reset();
            // Redirect to submissions page
            window.location.href = '/org/org-submissions.html';
        } else {
            alert('Error submitting form: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while submitting the form. Please try again.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Get selected categories as comma-separated string
function getSelectedCategories() {
    const checkboxes = document.querySelectorAll('input[name="category"]:checked');
    const categories = Array.from(checkboxes).map(cb => cb.value);
    return categories.length > 0 ? categories.join(', ') : '';
}

// Clear form handler
function clearForm() {
    if (confirm('Are you sure you want to clear the form? All entered data will be lost.')) {
        document.getElementById('orgSubmissionForm').reset();
    }
}

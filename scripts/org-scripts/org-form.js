/**
 * Organization Form Submission Handler
 *
 * Manages the organization submission form including validation, data collection,
 * AJAX submission to backend API, and handling success/error responses.
 * Collects organization details, applicant info, adviser info, categories, event details, and video link.
 */

let eventCounter = 1;

function submitForm(event) {
  event.preventDefault();

  const form = document.getElementById("orgSubmissionForm");

  if (!form.checkValidity()) {
    alert("Please fill in all required fields");
    form.reportValidity();
    return;
  }

  // Collect form data as JSON
  const formData = {
    submission_title: document.getElementById("submission_title").value,
    org_full_name: document.getElementById("org_full_name").value,
    org_acronym: document.getElementById("org_acronym").value,
    org_email: document.getElementById("org_email").value,
    social_media_links: document.getElementById("social_media_links").value || "",
    applicant_name: document.getElementById("applicant_name").value,
    applicant_position: document.getElementById("applicant_position").value,
    applicant_email: document.getElementById("applicant_email").value,
    adviser_names: document.getElementById("adviser_names").value,
    adviser_emails: document.getElementById("adviser_emails").value,
    category: getSelectedCategories(),
    org_type: document.querySelector('input[name="org_type"]:checked').value,
    cbl_status: document.querySelector('input[name="cbl_status"]:checked').value,
    events: getEventDetails()
  };

  if (!formData.category) {
    alert("Please select at least one category");
    return;
  }

  if (!formData.events || formData.events.length === 0) {
    alert("Please add at least one event");
    return;
  }

  const submitBtn = event.target;
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  fetch("/api/submit-form.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Form submitted successfully!");
        form.reset();
        window.location.href = "/org/org-submissions.html";
      } else {
        alert("Error submitting form: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while submitting the form. Please try again.");
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
}

function getSelectedCategories() {
  const checkboxes = document.querySelectorAll(
    'input[name="category"]:checked'
  );
  const categories = Array.from(checkboxes).map((cb) => cb.value);
  return categories.length > 0 ? categories.join(", ") : "";
}

function getEventDetails() {
  const eventEntries = document.querySelectorAll(".event-entry");
  const events = [];

  eventEntries.forEach((entry) => {
    const index = entry.dataset.eventIndex;
    const eventName = entry.querySelector(`[name="event_name_${index}"]`)?.value;
    const eventDate = entry.querySelector(`[name="event_date_${index}"]`)?.value;
    const eventVenue = entry.querySelector(`[name="event_venue_${index}"]`)?.value;
    const eventDescription = entry.querySelector(`[name="event_description_${index}"]`)?.value;
    const eventParticipants = entry.querySelector(`[name="event_participants_${index}"]`)?.value;
    const eventBudget = entry.querySelector(`[name="event_budget_${index}"]`)?.value;

    if (eventName && eventDate && eventVenue && eventDescription && eventParticipants) {
      events.push({
        name: eventName,
        date: eventDate,
        venue: eventVenue,
        description: eventDescription,
        participants: eventParticipants,
        budget: eventBudget || "0"
      });
    }
  });

  return events;
}

function addEvent() {
  const eventsContainer = document.getElementById("eventsContainer");
  const newEventHTML = `
    <div class="event-entry" data-event-index="${eventCounter}">
      <div class="event-header">
        <h4 class="event-title">Event ${eventCounter + 1}</h4>
        <button type="button" class="btn btn--danger btn--small" onclick="removeEvent(this)">Remove</button>
      </div>
      
      <div class="form-group">
        <label class="form-label form-label--required">Event Name</label>
        <input type="text" class="form-input event-name" 
          name="event_name_${eventCounter}" 
          required
          placeholder="e.g. Annual General Assembly, Fundraising Drive">
      </div>

      <div class="form-group">
        <label class="form-label form-label--required">Event Date</label>
        <input type="date" class="form-input event-date" 
          name="event_date_${eventCounter}" 
          required>
      </div>

      <div class="form-group">
        <label class="form-label form-label--required">Event Venue</label>
        <input type="text" class="form-input event-venue" 
          name="event_venue_${eventCounter}" 
          required
          placeholder="e.g. Main Auditorium, Room 301, Online via Zoom">
      </div>

      <div class="form-group">
        <label class="form-label form-label--required">Event Description</label>
        <textarea class="form-input event-description" 
          name="event_description_${eventCounter}" 
          rows="3"
          required
          placeholder="Brief description of the event and its objectives"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label form-label--required">Expected Number of Participants</label>
        <input type="number" class="form-input event-participants" 
          name="event_participants_${eventCounter}" 
          min="1"
          required
          placeholder="e.g. 50">
      </div>

      <div class="form-group">
        <label class="form-label">Budget Estimate (PHP)</label>
        <input type="number" class="form-input event-budget" 
          name="event_budget_${eventCounter}" 
          min="0"
          step="0.01"
          placeholder="e.g. 5000.00">
      </div>

      <div class="form-group">
        <label class="form-label">
          <span class="placeholder-icon">📎</span>
          Attachment (Coming Soon)
        </label>
        <div class="upload-placeholder-box">
          <p class="placeholder-text">File upload feature will be available in a future update</p>
          <p class="placeholder-hint">You'll be able to attach images, PDFs, and documents to your events</p>
        </div>
      </div>
    </div>
  `;

  eventsContainer.insertAdjacentHTML("beforeend", newEventHTML);
  eventCounter++;
}

function removeEvent(button) {
  const eventEntry = button.closest(".event-entry");
  const eventsContainer = document.getElementById("eventsContainer");
  
  // Prevent removing the last event
  if (eventsContainer.children.length <= 1) {
    alert("You must have at least one event.");
    return;
  }
  
  if (confirm("Are you sure you want to remove this event?")) {
    eventEntry.remove();
    updateEventTitles();
  }
}

function updateEventTitles() {
  const eventEntries = document.querySelectorAll(".event-entry");
  eventEntries.forEach((entry, index) => {
    const title = entry.querySelector(".event-title");
    if (title) {
      title.textContent = `Event ${index + 1}`;
    }
  });
}

function clearForm() {
  if (
    confirm(
      "Are you sure you want to clear the form? All entered data will be lost."
    )
  ) {
    document.getElementById("orgSubmissionForm").reset();
    
    // Reset events to just one
    const eventsContainer = document.getElementById("eventsContainer");
    const eventEntries = eventsContainer.querySelectorAll(".event-entry");
    eventEntries.forEach((entry, index) => {
      if (index > 0) {
        entry.remove();
      }
    });
    
    // Clear file inputs
    document.querySelectorAll('.event-file').forEach(input => {
      input.value = '';
    });
    document.querySelectorAll('.file-info').forEach(info => {
      info.innerHTML = '<span class="file-hint">Supported: PDF, DOC, DOCX, JPG, PNG, GIF (Max 5MB)</span>';
    });
    
    eventCounter = 1;
  }
}

// Placeholder for future file upload feature
// File handling functions will be implemented in a future update
function handleFileSelect(input, eventIndex) {
  // Reserved for future implementation
  console.log('File upload feature coming soon');
}

function removeFile(eventIndex) {
  // Reserved for future implementation
  console.log('File upload feature coming soon');
}


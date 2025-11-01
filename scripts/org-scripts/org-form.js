/**
 * Organization Form Submission Handler
 *
 * Manages the organization submission form including validation, data collection,
 * AJAX submission to backend API, and handling success/error responses.
 * Collects organization details, applicant info, adviser info, categories, and video link.
 */

function submitForm(event) {
  event.preventDefault();

  const form = document.getElementById("orgSubmissionForm");

  if (!form.checkValidity()) {
    alert("Please fill in all required fields");
    form.reportValidity();
    return;
  }

  const formData = {
    submission_title: document.getElementById("submission_title").value,
    org_full_name: document.getElementById("org_full_name").value,
    org_acronym: document.getElementById("org_acronym").value,
    org_email: document.getElementById("org_email").value,
    social_media_links:
      document.getElementById("social_media_links").value || "",
    applicant_name: document.getElementById("applicant_name").value,
    applicant_position: document.getElementById("applicant_position").value,
    applicant_email: document.getElementById("applicant_email").value,
    adviser_names: document.getElementById("adviser_names").value,
    adviser_emails: document.getElementById("adviser_emails").value,
    category: getSelectedCategories(),
    org_type: document.querySelector('input[name="org_type"]:checked').value,
    cbl_status: document.querySelector('input[name="cbl_status"]:checked')
      .value,
    video_link: document.getElementById("video_link").value,
  };

  if (!formData.category) {
    alert("Please select at least one category");
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

function clearForm() {
  if (
    confirm(
      "Are you sure you want to clear the form? All entered data will be lost."
    )
  ) {
    document.getElementById("orgSubmissionForm").reset();
  }
}

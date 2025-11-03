// Load submissions when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadSubmissions();

  // Add event listener for search
  document
    .getElementById("searchInput")
    ?.addEventListener("input", filterSubmissions);

  // Add event listener for status filter
  document
    .getElementById("statusFilter")
    ?.addEventListener("change", filterSubmissions);
});

let allSubmissions = [];
let currentPage = 1;
let itemsPerPage = 10;
let filteredSubmissions = [];

// Load submissions from API
function loadSubmissions() {
  fetch("/api/get-submissions.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        allSubmissions = data.submissions;
        filteredSubmissions = [...allSubmissions];
        currentPage = 1;
        displaySubmissions(filteredSubmissions);
        updatePagination();
      } else {
        showEmptyState();
      }
    })
    .catch((error) => {
      console.error("Error loading submissions:", error);
      showError("Failed to load submissions. Please try again later.");
    });
}

// Display submissions in table
function displaySubmissions(submissions) {
  const tbody = document.querySelector(".submissions-table tbody");

  if (submissions.length === 0) {
    showEmptyState();
    hidePagination();
    return;
  }

  // Calculate pagination
  const totalPages = Math.ceil(submissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = submissions.slice(startIndex, endIndex);

  tbody.innerHTML = "";

  paginatedSubmissions.forEach((submission) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="title-cell">
                <div class="form-title">${escapeHtml(
                  submission.submission_title
                )}</div>
                <div class="form-subtitle">${escapeHtml(
                  submission.org_acronym
                )}</div>
            </td>
            <td>${formatDate(submission.submitted_date)}</td>
            <td><span class="status-badge ${
              submission.status
            }">${capitalizeFirst(submission.status)}</span></td>
            <td>v1</td>
            <td class="feedback-cell">${
              submission.status === "submitted"
                ? "Pending review"
                : "No feedback"
            }</td>
            <td>
                <button class="action-btn view-btn" onclick="viewSubmission(${
                  submission.id
                })">View</button>
            </td>
        `;
    tbody.appendChild(row);
  });

  hideEmptyState();
  showPagination();
  updatePagination();
}

// Update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginationNumbers = document.querySelector(".pagination-numbers");
  const prevButton = document.querySelector(".pagination-btn:first-child");
  const nextButton = document.querySelector(".pagination-btn:last-child");

  // Update prev/next buttons
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages || totalPages === 0;

  // Generate page numbers
  paginationNumbers.innerHTML = "";

  if (totalPages <= 5) {
    // Show all pages if 5 or fewer
    for (let i = 1; i <= totalPages; i++) {
      paginationNumbers.appendChild(createPageButton(i));
    }
  } else {
    // Show smart pagination
    if (currentPage <= 3) {
      // Show first 3 pages + ellipsis + last page
      for (let i = 1; i <= 3; i++) {
        paginationNumbers.appendChild(createPageButton(i));
      }
      paginationNumbers.appendChild(createEllipsis());
      paginationNumbers.appendChild(createPageButton(totalPages));
    } else if (currentPage >= totalPages - 2) {
      // Show first page + ellipsis + last 3 pages
      paginationNumbers.appendChild(createPageButton(1));
      paginationNumbers.appendChild(createEllipsis());
      for (let i = totalPages - 2; i <= totalPages; i++) {
        paginationNumbers.appendChild(createPageButton(i));
      }
    } else {
      // Show first page + ellipsis + current page neighbors + ellipsis + last page
      paginationNumbers.appendChild(createPageButton(1));
      paginationNumbers.appendChild(createEllipsis());
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        paginationNumbers.appendChild(createPageButton(i));
      }
      paginationNumbers.appendChild(createEllipsis());
      paginationNumbers.appendChild(createPageButton(totalPages));
    }
  }

  // Add event listeners
  prevButton.onclick = () => goToPage(currentPage - 1);
  nextButton.onclick = () => goToPage(currentPage + 1);
}

// Create page button
function createPageButton(pageNum) {
  const button = document.createElement("button");
  button.className = "page-number" + (pageNum === currentPage ? " active" : "");
  button.textContent = pageNum;
  button.onclick = () => goToPage(pageNum);
  return button;
}

// Create ellipsis
function createEllipsis() {
  const span = document.createElement("span");
  span.className = "pagination-ellipsis";
  span.textContent = "...";
  return span;
}

// Go to specific page
function goToPage(pageNum) {
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  if (pageNum < 1 || pageNum > totalPages) return;

  currentPage = pageNum;
  displaySubmissions(filteredSubmissions);
}

// Show pagination
function showPagination() {
  const paginationContainer = document.querySelector(".pagination-container");
  if (paginationContainer) {
    paginationContainer.style.display = "block";
  }
}

// Hide pagination
function hidePagination() {
  const paginationContainer = document.querySelector(".pagination-container");
  if (paginationContainer) {
    paginationContainer.style.display = "none";
  }
}

// Filter submissions based on search and status
function filterSubmissions() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;

  filteredSubmissions = allSubmissions.filter((submission) => {
    const matchesSearch =
      submission.submission_title.toLowerCase().includes(searchTerm) ||
      submission.org_acronym.toLowerCase().includes(searchTerm) ||
      submission.org_full_name.toLowerCase().includes(searchTerm);

    const matchesStatus = !statusFilter || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  currentPage = 1; // Reset to first page when filtering
  displaySubmissions(filteredSubmissions);
}

// View submission details
function viewSubmission(id) {
  const submission = allSubmissions.find((s) => s.id == id);
  if (!submission) {
    alert("Submission not found");
    return;
  }

  // Update modal with submission data
  document.getElementById("modalFormTitle").textContent =
    submission.submission_title;
  document.getElementById("modalSubmittedDate").textContent = formatDate(
    submission.submitted_date
  );
  document.getElementById("modalStatus").textContent = capitalizeFirst(
    submission.status
  );
  document.getElementById("modalStatus").className =
    "status-badge " + submission.status;
  document.getElementById("modalVersion").textContent = "v1";
  document.getElementById("modalFeedback").textContent =
    submission.status === "submitted" ? "Pending review" : "No feedback";

  // Update form content in modal
  updateModalContent(submission);

  // Show modal
  document.getElementById("viewModal").style.display = "block";
}

// Update modal content with submission details
function updateModalContent(submission) {
  // This is a simplified version - you would update all fields in the modal
  const modalBody = document.querySelector(".modal-body .form-view-container");

  modalBody.innerHTML = `
        <h3>Submission Information</h3>
        
        <div class="view-section">
            <h4>Organization Information</h4>
            <div class="view-field">
                <label>Complete Name of Organization:</label>
                <div class="field-value">${escapeHtml(
                  submission.org_full_name
                )}</div>
            </div>
            <div class="view-field">
                <label>Acronym:</label>
                <div class="field-value">${escapeHtml(
                  submission.org_acronym
                )}</div>
            </div>
            <div class="view-field">
                <label>Official SLU Institutional Email:</label>
                <div class="field-value">${escapeHtml(
                  submission.org_email
                )}</div>
            </div>
            <div class="view-field">
                <label>Social Media Pages:</label>
                <div class="field-value">${escapeHtml(
                  submission.social_media_links || "N/A"
                )}</div>
            </div>
        </div>

        <div class="view-section">
            <h4>Applicant Information</h4>
            <div class="view-field">
                <label>Name of Applicant:</label>
                <div class="field-value">${escapeHtml(
                  submission.applicant_name
                )}</div>
            </div>
            <div class="view-field">
                <label>Position:</label>
                <div class="field-value">${escapeHtml(
                  submission.applicant_position
                )}</div>
            </div>
            <div class="view-field">
                <label>Applicant's Email:</label>
                <div class="field-value">${escapeHtml(
                  submission.applicant_email
                )}</div>
            </div>
        </div>

        <div class="view-section">
            <h4>Adviser Information</h4>
            <div class="view-field">
                <label>Name of Adviser/s:</label>
                <div class="field-value">${escapeHtml(
                  submission.adviser_names
                )}</div>
            </div>
            <div class="view-field">
                <label>Adviser Email/s:</label>
                <div class="field-value">${escapeHtml(
                  submission.adviser_emails
                )}</div>
            </div>
        </div>

        <div class="view-section">
            <h4>Category & Type</h4>
            <div class="view-field">
                <label>Category:</label>
                <div class="field-value">${escapeHtml(
                  submission.category
                )}</div>
            </div>
            <div class="view-field">
                <label>Type of Organization:</label>
                <div class="field-value">${capitalizeFirst(
                  submission.org_type
                )}</div>
            </div>
        </div>

        <div class="view-section">
            <h4>Additional Information</h4>
            <div class="view-field">
                <label>CBL Status:</label>
                <div class="field-value">${capitalizeFirst(
                  submission.cbl_status
                )}</div>
            </div>
            <div class="view-field">
                <label>Video Link:</label>
                <div class="field-value"><a href="${escapeHtml(
                  submission.video_link
                )}" target="_blank">${escapeHtml(
    submission.video_link
  )}</a></div>
            </div>
        </div>
    `;
}

// Close modal
function closeModal() {
  document.getElementById("viewModal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("viewModal");
  if (event.target === modal) {
    closeModal();
  }
};

// Show empty state
function showEmptyState() {
  const tbody = document.querySelector(".submissions-table tbody");
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
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    emptyState.style.display = "none";
  }
}

// Show error message
function showError(message) {
  const tbody = document.querySelector(".submissions-table tbody");
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
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text ? text.replace(/[&<>"']/g, (m) => map[m]) : "";
}

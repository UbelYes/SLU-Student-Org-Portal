/**
 * OSA Documents - Document Management with Pagination
 */

// Documents data
let allDocuments = [];
let filteredDocuments = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = "date-newest";

/**
 * Initialize the page
 */
document.addEventListener("DOMContentLoaded", () => {
  loadDocuments();
  setupEventListeners();
});

/**
 * Load documents from the server
 */
async function loadDocuments() {
  try {
    const searchTerm = document.getElementById("document-search")?.value || "";
    const response = await fetch(
      `/api/get-documents.php?search=${encodeURIComponent(
        searchTerm
      )}&sort=${currentSort}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch documents");
    }

    const data = await response.json();

    if (data.success) {
      allDocuments = data.documents;
      filteredDocuments = [...allDocuments];
      displayDocuments();
    } else {
      throw new Error(data.message || "Failed to load documents");
    }
  } catch (error) {
    console.error("Error loading documents:", error);
    const tbody = document.getElementById("documents-table-body");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: red;">Error loading documents: ${error.message}</td></tr>`;
    }
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const searchInput = document.getElementById("document-search");
  const sortSelect = document.getElementById("sort-by");

  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300));
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", handleSort);
  }
}

/**
 * Refresh documents from server
 */
function refreshDocuments() {
  currentPage = 1;
  loadDocuments();
}

/**
 * Display documents with pagination
 */
function displayDocuments() {
  const tbody = document.getElementById("documents-table-body");

  if (!tbody) return;

  // Calculate pagination
  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Get documents for current page
  const pageDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Display documents
  if (pageDocuments.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center">No documents found</td></tr>';
  } else {
    tbody.innerHTML = pageDocuments
      .map(
        (doc, index) => `
            <tr>
                <td>
                    <div class="file-info">
                        <span class="file-icon">${getFileIcon(
                          doc.fileName
                        )}</span>
                        <div style="display: flex; flex-direction: column;">
                            <span class="file-name">${escapeHtml(
                              doc.fileName
                            )}</span>
                            <small style="color: #666;">${escapeHtml(
                              doc.documentType
                            )} | ${escapeHtml(doc.orgAcronym)}</small>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(doc.uploadedBy)}</td>
                <td>${formatDate(doc.uploadedDate)}</td>
                <td class="action-buttons">
                    <button class="btn-view" onclick="viewDocument(${
                      startIndex + index
                    })" title="View document details">View</button>
                    <button class="btn-download" onclick="downloadDocument(${
                      startIndex + index
                    })" title="Download document">Download</button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  // Update pagination info
  updatePaginationInfo(totalItems, startIndex, endIndex);

  // Update pagination controls
  updatePaginationControls(totalPages);
}

/**
 * Update pagination info text
 */
function updatePaginationInfo(total, start, end) {
  const infoText = document.getElementById("pagination-info-text");
  if (infoText) {
    if (total === 0) {
      infoText.textContent = "Showing 0 of 0 documents";
    } else {
      infoText.textContent = `Showing ${
        start + 1
      }-${end} of ${total} documents`;
    }
  }
}

/**
 * Update pagination controls
 */
function updatePaginationControls(totalPages) {
  const firstBtn = document.getElementById("first-page");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const lastBtn = document.getElementById("last-page");
  const pageNumbers = document.getElementById("page-numbers");

  // Update button states
  if (firstBtn) firstBtn.disabled = currentPage === 1;
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn)
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  if (lastBtn)
    lastBtn.disabled = currentPage === totalPages || totalPages === 0;

  // Update page numbers
  if (pageNumbers) {
    pageNumbers.innerHTML = generatePageNumbers(totalPages);
  }
}

/**
 * Generate page number buttons
 */
function generatePageNumbers(totalPages) {
  if (totalPages === 0) {
    return '<button class="btn-page-num active">1</button>';
  }

  let pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show subset with ellipsis
    if (currentPage <= 3) {
      pages = [1, 2, 3, 4, "...", totalPages];
    } else if (currentPage >= totalPages - 2) {
      pages = [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      pages = [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    }
  }

  return pages
    .map((page) => {
      if (page === "...") {
        return '<span class="page-ellipsis">...</span>';
      }
      const isActive = page === currentPage ? "active" : "";
      return `<button class="btn-page-num ${isActive}" onclick="goToPage(${page})">${page}</button>`;
    })
    .join("");
}

/**
 * Pagination functions
 */
function goToPage(page) {
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  displayDocuments();
}

function nextPage() {
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayDocuments();
  }
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    displayDocuments();
  }
}

function goToLastPage() {
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  currentPage = totalPages > 0 ? totalPages : 1;
  displayDocuments();
}

function changeItemsPerPage() {
  const select = document.getElementById("items-per-page");
  if (select) {
    itemsPerPage = parseInt(select.value);
    currentPage = 1; // Reset to first page
    displayDocuments();
  }
}

/**
 * Handle search
 */
function handleSearch() {
  currentPage = 1; // Reset to first page
  loadDocuments(); // Reload from server with search term
}

/**
 * Handle sorting
 */
function handleSort() {
  const sortSelect = document.getElementById("sort-by");
  if (sortSelect) {
    currentSort = sortSelect.value;
    currentPage = 1; // Reset to first page
    loadDocuments(); // Reload from server with new sort
  }
}

/**
 * View document
 */
function viewDocument(index) {
  const doc = filteredDocuments[index];
  if (!doc) return;

  const details = `Document Details:
    
File: ${doc.fileName}
Type: ${doc.documentType}
Organization: ${doc.uploadedBy} (${doc.orgAcronym})
Submission: ${doc.submissionTitle}
Status: ${doc.submissionStatus}
Uploaded: ${formatDate(doc.uploadedDate)}
Size: ${formatFileSize(doc.fileSize)}

File Path: ${doc.filePath}`;

  alert(details);
}

/**
 * Download document
 */
function downloadDocument(index) {
  const doc = filteredDocuments[index];
  if (!doc) return;

  // In a real application, this would trigger a file download
  alert(
    `Downloading: ${doc.fileName}\n\nFile download functionality will be implemented when file upload is complete.`
  );

  // Future implementation:
  // window.location.href = `/api/download-document.php?id=${doc.id}`;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Utility functions
 */
function getFileIcon(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "xls":
    case "xlsx":
      return "📊";
    case "ppt":
    case "pptx":
      return "📽️";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "🖼️";
    default:
      return "📎";
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
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

/**
 * Refresh documents data
 */
function refreshDocuments() {
  // Store current state
  const currentSearchValue =
    document.getElementById("document-search")?.value || "";
  const currentSortValue = currentSort;
  const currentPageValue = currentPage;
  const currentItemsPerPageValue = itemsPerPage;

  // Reload documents from localStorage
  loadDocuments();

  // Restore state
  currentSort = currentSortValue;
  currentPage = currentPageValue;
  itemsPerPage = currentItemsPerPageValue;

  // Reapply search if there was one
  if (currentSearchValue) {
    const searchInput = document.getElementById("document-search");
    if (searchInput) {
      searchInput.value = currentSearchValue;
      const searchTerm = currentSearchValue.toLowerCase().trim();
      filteredDocuments = allDocuments.filter(
        (doc) =>
          doc.fileName.toLowerCase().includes(searchTerm) ||
          doc.uploadedBy.toLowerCase().includes(searchTerm)
      );
    }
  }

  // Reapply sorting and display
  applySorting();
  displayDocuments();

  // Show success notification
  showNotification("Documents refreshed successfully", "success");
}

/**
 * Show notification toast
 */
function showNotification(message, type = "success") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(
    ".notification-toast"
  );
  existingNotifications.forEach((notification) => notification.remove());

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification-toast ${type}`;
  notification.textContent = message;

  // Add styles
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 20px",
    backgroundColor: type === "success" ? "#10B981" : "#EF4444",
    color: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: "1000",
    fontFamily: '"Arimo", sans-serif',
    fontSize: "14px",
    fontWeight: "500",
    animation: "slideIn 0.3s ease",
  });

  // Add animation keyframes
  if (!document.getElementById("notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
    document.head.appendChild(style);
  }

  // Add to page
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

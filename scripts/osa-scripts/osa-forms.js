// Get DOM elements
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-by');
const tableBody = document.querySelector('.form-table tbody');
const tableHeaders = document.querySelectorAll('.form-table th');

// Store the original table data
let tableData = [];
let currentSort = {
    column: null,
    ascending: true
};

// Pagination state
let formsCurrentPage = 1;
let formsItemsPerPage = 10;
let formsFilteredData = [];

// Initialize the table data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load submissions from API
    loadSubmissions();

    // Add event listeners
    searchInput.addEventListener('input', filterAndSortTable);
    sortSelect.addEventListener('change', filterAndSortTable);

    // Add click event listeners to headers
    tableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => handleHeaderClick(index));
    });

    // Handle view button clicks using event delegation (works with dynamically added rows)
    tableBody.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-button');
        if (viewBtn) {
            e.preventDefault();
            const submissionId = viewBtn.getAttribute('data-id');
            openViewModal(submissionId);
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('viewModal');
        if (event.target === modal) {
            closeViewModal();
        }
    });
});

// Load submissions from API
function loadSubmissions() {
    fetch('/api/get-submissions.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                tableData = data.submissions.map(submission => {
                    return {
                        id: submission.id,
                        title: submission.submission_title,
                        organization: submission.org_acronym || submission.org_full_name,
                        submittedBy: submission.applicant_name,
                        date: formatDate(submission.submitted_date),
                        school: submission.category,
                        status: submission.status || 'Pending',
                        rawData: submission // Store the full submission data
                    };
                });

                // Initialize filtered data
                formsFilteredData = [...tableData];
                
                // Display initial page
                displayFormsData();
            } else {
                showNotification('Error loading submissions: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to load submissions', 'error');
        });
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
    });
}

// Function to open view modal
function openViewModal(submissionId) {
    const modal = document.getElementById('viewModal');
    
    // Find the submission data by ID
    const submissionData = tableData.find(item => item.id == submissionId);
    
    if (!submissionData || !submissionData.rawData) {
        showNotification('Error loading submission details', 'error');
        return;
    }
    
    const submission = submissionData.rawData;
    
    // Update modal with data
    document.getElementById('modalFormTitle').textContent = submission.submission_title;
    document.getElementById('modalOrgName').textContent = submission.org_full_name;
    document.getElementById('modalSubmittedBy').textContent = submission.applicant_name;
    document.getElementById('modalSubmittedDate').textContent = formatDate(submission.submitted_date);
    document.getElementById('modalSchool').textContent = submission.category;
    
    const statusElement = document.getElementById('modalStatus');
    statusElement.textContent = submission.status || 'Pending';
    statusElement.className = 'status-badge ' + (submission.status || 'pending').toLowerCase();
    
    // Update organization information
    document.getElementById('modalOrgFullName').textContent = submission.org_full_name;
    document.getElementById('modalOrgAcronym').textContent = submission.org_acronym;
    document.getElementById('modalOrgEmail').textContent = submission.org_email;
    document.getElementById('modalSocialMedia').textContent = submission.social_media_links || 'N/A';
    
    // Update applicant information
    document.getElementById('modalApplicantName').textContent = submission.applicant_name;
    document.getElementById('modalApplicantPosition').textContent = submission.applicant_position;
    document.getElementById('modalApplicantEmail').textContent = submission.applicant_email;
    
    // Update adviser information
    document.getElementById('modalAdviserNames').textContent = submission.adviser_names;
    document.getElementById('modalAdviserEmails').textContent = submission.adviser_emails;
    
    // Update category and type
    document.getElementById('modalCategory').textContent = submission.category;
    document.getElementById('modalOrgType').textContent = submission.org_type;
    
    // Update additional information
    document.getElementById('modalCblStatus').textContent = submission.cbl_status;
    
    const videoLinkElement = document.getElementById('modalVideoLink');
    if (submission.video_link) {
        videoLinkElement.innerHTML = `<a href="${submission.video_link}" target="_blank">${submission.video_link}</a>`;
    } else {
        videoLinkElement.textContent = 'N/A';
    }
    
    // Show modal
    modal.style.display = 'block';
}

// Function to close view modal
function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

// Function to handle header clicks
function handleHeaderClick(columnIndex) {
    const columns = ['title', 'organization', 'submittedBy', 'date', 'school', 'status'];
    const column = columns[columnIndex];

    // Remove sort classes from all headers
    tableHeaders.forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
    });

    // Update sort direction
    if (currentSort.column === column) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = column;
        currentSort.ascending = true;
    }

    // Add sort class to clicked header
    tableHeaders[columnIndex].classList.add(
        currentSort.ascending ? 'sort-asc' : 'sort-desc'
    );

    filterAndSortTable();
}

// Function to filter and sort the table
function filterAndSortTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    // Filter the data based on search term
    let filteredData = tableData.filter(row => {
        return row.title.toLowerCase().includes(searchTerm) ||
            row.organization.toLowerCase().includes(searchTerm) ||
            row.submittedBy.toLowerCase().includes(searchTerm) ||
            row.school.toLowerCase().includes(searchTerm) ||
            row.status.toLowerCase().includes(searchTerm);
    });

    // Sort the filtered data
    if (currentSort.column) {
        // Header click sorting takes precedence
        filteredData.sort((a, b) => {
            let comparison = 0;
            const aValue = a[currentSort.column];
            const bValue = b[currentSort.column];

            if (currentSort.column === 'date') {
                comparison = new Date(aValue) - new Date(bValue);
            } else {
                comparison = aValue.localeCompare(bValue);
            }

            return currentSort.ascending ? comparison : -comparison;
        });
    } else {
        // Dropdown sorting
        filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'date-newest':
                    return new Date(b.date) - new Date(a.date);
                case 'date-oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'name-az':
                    return a.title.localeCompare(b.title);
                case 'name-za':
                    return b.title.localeCompare(a.title);
                case 'org':
                    return a.organization.localeCompare(b.organization);
                default:
                    return 0;
            }
        });
    }

    // Update filtered data and reset to first page
    formsFilteredData = filteredData;
    formsCurrentPage = 1;
    displayFormsData();
}

// Function to update the table display with pagination
function updateTableDisplay(data) {
    // Clear the table body
    tableBody.innerHTML = '';

    if (data.length === 0) {
        // Show no results message
        const noResultsRow = document.createElement('tr');
        noResultsRow.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px;">
                No matching records found
            </td>
        `;
        tableBody.appendChild(noResultsRow);
    } else {
        // Add filtered and sorted rows
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'table-data';
            
            // Determine status class
            const statusClass = (row.status || 'pending').toLowerCase();
            
            tr.innerHTML = `
                <td>${row.title}</td>
                <td>${row.organization}</td>
                <td>${row.submittedBy}</td>
                <td>${row.date}</td>
                <td>${row.school}</td>
                <td><span class="status-badge ${statusClass}">${row.status}</span></td>
                <td>
                    <div class="action-container">
                        <button class="view-button" data-id="${row.id}">
                            <img src="../resources/icons/view-icon.svg" alt="View">
                            View
                        </button>
                        <button class="download-button">
                            <img src="../resources/icons/download-icon-white.svg" alt="Download">
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
    }
}

// Display forms data with pagination
function displayFormsData() {
    const totalForms = formsFilteredData.length;
    const totalPages = Math.ceil(totalForms / formsItemsPerPage);
    
    // Calculate start and end indices
    const startIndex = (formsCurrentPage - 1) * formsItemsPerPage;
    const endIndex = Math.min(startIndex + formsItemsPerPage, totalForms);
    
    // Get the data for current page
    const pageData = formsFilteredData.slice(startIndex, endIndex);
    
    // Update table display
    updateTableDisplay(pageData);
    
    // Update pagination info
    updateFormsPaginationInfo(startIndex, endIndex, totalForms);
    
    // Update pagination controls
    updateFormsPaginationControls(totalPages);
}

// Function to refresh the forms data
function refreshForms() {
    // Show loading notification
    showNotification('Refreshing forms data...', 'info');
    
    // Reload submissions from API
    loadSubmissions();
}

// Function to show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.textContent = message;
    
    // Determine background color based on type
    let backgroundColor;
    switch(type) {
        case 'success':
            backgroundColor = '#10B981';
            break;
        case 'error':
            backgroundColor = '#EF4444';
            break;
        case 'info':
            backgroundColor = '#3B82F6';
            break;
        default:
            backgroundColor = '#10B981';
    }
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        backgroundColor: backgroundColor,
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: '1000',
        fontFamily: '"Arimo", sans-serif',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'slideIn 0.3s ease'
    });
    
    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
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
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== Pagination Functions ==========

// Navigate to specific page
function formsGoToPage(page) {
    const totalPages = Math.ceil(formsFilteredData.length / formsItemsPerPage);
    if (page >= 1 && page <= totalPages) {
        formsCurrentPage = page;
        displayFormsData();
    }
}

// Next page
function formsNextPage() {
    const totalPages = Math.ceil(formsFilteredData.length / formsItemsPerPage);
    if (formsCurrentPage < totalPages) {
        formsCurrentPage++;
        displayFormsData();
    }
}

// Previous page
function formsPreviousPage() {
    if (formsCurrentPage > 1) {
        formsCurrentPage--;
        displayFormsData();
    }
}

// Go to last page
function formsGoToLastPage() {
    const totalPages = Math.ceil(formsFilteredData.length / formsItemsPerPage);
    formsCurrentPage = totalPages;
    displayFormsData();
}

// Change items per page
function formsChangeItemsPerPage() {
    const select = document.getElementById('forms-items-per-page');
    formsItemsPerPage = parseInt(select.value);
    formsCurrentPage = 1;
    displayFormsData();
}

// Update pagination info text
function updateFormsPaginationInfo(start, end, total) {
    const infoElement = document.getElementById('forms-pagination-info');
    if (total === 0) {
        infoElement.textContent = 'Showing 0 of 0 forms';
    } else {
        infoElement.textContent = `Showing ${start + 1}-${end} of ${total} forms`;
    }
}

// Update pagination controls (buttons and page numbers)
function updateFormsPaginationControls(totalPages) {
    const firstPageBtn = document.getElementById('forms-first-page');
    const prevPageBtn = document.getElementById('forms-prev-page');
    const nextPageBtn = document.getElementById('forms-next-page');
    const lastPageBtn = document.getElementById('forms-last-page');
    const pageNumbersContainer = document.getElementById('forms-page-numbers');
    
    // Disable/enable navigation buttons
    firstPageBtn.disabled = formsCurrentPage === 1;
    prevPageBtn.disabled = formsCurrentPage === 1;
    nextPageBtn.disabled = formsCurrentPage === totalPages || totalPages === 0;
    lastPageBtn.disabled = formsCurrentPage === totalPages || totalPages === 0;
    
    // Generate page number buttons
    pageNumbersContainer.innerHTML = '';
    const pageNumbers = generatePageNumbers(formsCurrentPage, totalPages);
    
    pageNumbers.forEach(page => {
        if (page === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        } else {
            const button = document.createElement('button');
            button.className = 'btn-page-num';
            button.textContent = page;
            button.onclick = () => formsGoToPage(page);
            
            if (page === formsCurrentPage) {
                button.classList.add('active');
            }
            
            pageNumbersContainer.appendChild(button);
        }
    });
}

// Generate smart page numbers with ellipsis
function generatePageNumbers(current, total) {
    const pages = [];
    
    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        if (current <= 4) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(total);
        } else if (current >= total - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = total - 4; i <= total; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = current - 1; i <= current + 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(total);
        }
    }
    
    return pages;
}

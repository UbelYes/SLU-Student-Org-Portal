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
    // Get all table rows and convert them to array of objects
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    tableData = rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
            element: row,
            title: cells[0]?.textContent || '',
            organization: cells[1]?.textContent || '',
            submittedBy: cells[2]?.textContent || '',
            date: cells[3]?.textContent || '',
            school: cells[4]?.textContent || '',
            status: cells[5]?.querySelector('.status-badge')?.textContent || ''
        };
    });

    // Initialize filtered data
    formsFilteredData = [...tableData];
    
    // Display initial page
    displayFormsData();

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
            openViewModal(viewBtn);
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

// Function to open view modal
function openViewModal(button) {
    const modal = document.getElementById('viewModal');
    
    // Get the row data
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');
    const title = cells[0].textContent;
    const orgName = cells[1].textContent;
    const submittedBy = cells[2].textContent;
    const date = cells[3].textContent;
    const school = cells[4].textContent;
    const status = cells[5].querySelector('.status-badge').textContent;
    const statusClass = cells[5].querySelector('.status-badge').className;
    
    // Update modal with data
    document.getElementById('modalFormTitle').textContent = title;
    document.getElementById('modalOrgName').textContent = orgName;
    document.getElementById('modalSubmittedBy').textContent = submittedBy;
    document.getElementById('modalSubmittedDate').textContent = date;
    document.getElementById('modalSchool').textContent = school;
    document.getElementById('modalStatus').textContent = status;
    document.getElementById('modalStatus').className = statusClass;
    
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
            tableBody.appendChild(row.element.cloneNode(true));
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
    // Store current state
    const currentSearch = searchInput.value;
    const currentSortValue = sortSelect.value;
    const currentSortState = { ...currentSort };
    
    // Reload the table data (re-query the DOM)
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    tableData = rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
            element: row,
            title: cells[0]?.textContent || '',
            organization: cells[1]?.textContent || '',
            submittedBy: cells[2]?.textContent || '',
            date: cells[3]?.textContent || '',
            school: cells[4]?.textContent || '',
            status: cells[5]?.querySelector('.status-badge')?.textContent || ''
        };
    });
    
    // Restore state
    currentSort = currentSortState;
    
    // Reapply filters and sorting
    filterAndSortTable();
    
    // Show success notification
    showNotification('Forms data refreshed successfully', 'success');
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
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        backgroundColor: type === 'success' ? '#10B981' : '#EF4444',
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

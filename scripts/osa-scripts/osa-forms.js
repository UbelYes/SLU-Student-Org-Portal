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

    // Add event listeners
    searchInput.addEventListener('input', filterAndSortTable);
    sortSelect.addEventListener('change', filterAndSortTable);

    // Add click event listeners to headers
    tableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => handleHeaderClick(index));
    });

    // Delegate click events on the table body for dynamic rows (handles cloned rows)
    tableBody.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-button');
        if (viewBtn) {
            // Navigate to the OSA view page
            // Use a relative path because this script runs from pages under /osa-staff/
            window.location.href = 'osa-view.html';
        }
    });
});

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

    // Update the table display
    updateTableDisplay(filteredData);
}

// Function to update the table display
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

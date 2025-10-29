/**
 * OSA Documents - Document Management with Pagination
 */

// Sample documents data
let allDocuments = [];
let filteredDocuments = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = 'date-newest';

/**
 * Initialize the page
 */
document.addEventListener('DOMContentLoaded', () => {
    loadDocuments();
    setupEventListeners();
    displayDocuments();
});

/**
 * Load documents (from localStorage or generate sample data)
 */
function loadDocuments() {
    const storedDocs = localStorage.getItem('documents');
    
    if (storedDocs) {
        allDocuments = JSON.parse(storedDocs);
    } else {
        allDocuments = generateSampleDocuments();
        saveDocuments();
    }
    
    filteredDocuments = [...allDocuments];
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const searchInput = document.getElementById('document-search');
    const sortSelect = document.getElementById('sort-by');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

/**
 * Display documents with pagination
 */
function displayDocuments() {
    const tbody = document.getElementById('documents-table-body');
    
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
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No documents found</td></tr>';
    } else {
        tbody.innerHTML = pageDocuments.map((doc, index) => `
            <tr>
                <td>
                    <div class="file-info">
                        <span class="file-icon">${getFileIcon(doc.fileName)}</span>
                        <span class="file-name">${escapeHtml(doc.fileName)}</span>
                    </div>
                </td>
                <td>${escapeHtml(doc.uploadedBy)}</td>
                <td>${formatDate(doc.uploadDate)}</td>
                <td class="action-buttons">
                    <button class="btn-view" onclick="viewDocument(${startIndex + index})">View</button>
                    <button class="btn-download" onclick="downloadDocument(${startIndex + index})">Download</button>
                </td>
            </tr>
        `).join('');
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
    const infoText = document.getElementById('pagination-info-text');
    if (infoText) {
        if (total === 0) {
            infoText.textContent = 'Showing 0 of 0 documents';
        } else {
            infoText.textContent = `Showing ${start + 1}-${end} of ${total} documents`;
        }
    }
}

/**
 * Update pagination controls
 */
function updatePaginationControls(totalPages) {
    const firstBtn = document.getElementById('first-page');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const lastBtn = document.getElementById('last-page');
    const pageNumbers = document.getElementById('page-numbers');
    
    // Update button states
    if (firstBtn) firstBtn.disabled = currentPage === 1;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    if (lastBtn) lastBtn.disabled = currentPage === totalPages || totalPages === 0;
    
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
            pages = [1, 2, 3, 4, '...', totalPages];
        } else if (currentPage >= totalPages - 2) {
            pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
    }
    
    return pages.map(page => {
        if (page === '...') {
            return '<span class="page-ellipsis">...</span>';
        }
        const isActive = page === currentPage ? 'active' : '';
        return `<button class="btn-page-num ${isActive}" onclick="goToPage(${page})">${page}</button>`;
    }).join('');
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
    const select = document.getElementById('items-per-page');
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
    const searchInput = document.getElementById('document-search');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredDocuments = [...allDocuments];
    } else {
        filteredDocuments = allDocuments.filter(doc => 
            doc.fileName.toLowerCase().includes(searchTerm) ||
            doc.uploadedBy.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1; // Reset to first page
    applySorting();
    displayDocuments();
}

/**
 * Handle sorting
 */
function handleSort() {
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        currentSort = sortSelect.value;
        applySorting();
        displayDocuments();
    }
}

/**
 * Apply sorting to filtered documents
 */
function applySorting() {
    switch (currentSort) {
        case 'date-newest':
            filteredDocuments.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            break;
        case 'date-oldest':
            filteredDocuments.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
            break;
        case 'name-az':
            filteredDocuments.sort((a, b) => a.fileName.localeCompare(b.fileName));
            break;
        case 'name-za':
            filteredDocuments.sort((a, b) => b.fileName.localeCompare(a.fileName));
            break;
        case 'org':
            filteredDocuments.sort((a, b) => a.uploadedBy.localeCompare(b.uploadedBy));
            break;
    }
}

/**
 * View document
 */
function viewDocument(index) {
    const doc = filteredDocuments[index];
    if (!doc) return;
    
    alert(`Document Details:\n\nFile: ${doc.fileName}\nUploaded By: ${doc.uploadedBy}\nDate: ${formatDate(doc.uploadDate)}\n\nThis would open a document viewer in a real application.`);
}

/**
 * Download document
 */
function downloadDocument(index) {
    const doc = filteredDocuments[index];
    if (!doc) return;
    
    alert(`Downloading: ${doc.fileName}\n\nThis would trigger a file download in a real application.`);
}

/**
 * Generate sample documents
 */
function generateSampleDocuments() {
    const organizations = [
        'Computer Science Society',
        'Engineering Society',
        'Business Club',
        'SAMCIS',
        'ICON',
        'Student Council',
        'Medical Society',
        'Arts Club',
        'Sports Committee',
        'Environmental Club'
    ];
    
    const fileTypes = [
        { name: 'Activity Proposal', ext: 'pdf' },
        { name: 'Financial Report', ext: 'xlsx' },
        { name: 'Event Documentation', ext: 'docx' },
        { name: 'Budget Request', ext: 'xlsx' },
        { name: 'Attendance Sheet', ext: 'xlsx' },
        { name: 'Meeting Minutes', ext: 'docx' },
        { name: 'Accomplishment Report', ext: 'pdf' },
        { name: 'Project Proposal', ext: 'pdf' },
        { name: 'Member List', ext: 'xlsx' },
        { name: 'Event Photos', ext: 'pdf' }
    ];
    
    const docs = [];
    const now = new Date();
    
    // Generate 35 sample documents
    for (let i = 0; i < 35; i++) {
        const org = organizations[Math.floor(Math.random() * organizations.length)];
        const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
        const daysAgo = Math.floor(Math.random() * 60); // Random date within last 60 days
        
        docs.push({
            id: `doc-${i + 1}`,
            fileName: `${fileType.name}_${org.replace(/\s+/g, '_')}.${fileType.ext}`,
            uploadedBy: org,
            uploadDate: new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    
    return docs;
}

/**
 * Save documents to localStorage
 */
function saveDocuments() {
    localStorage.setItem('documents', JSON.stringify(allDocuments));
}

/**
 * Utility functions
 */
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    
    switch (ext) {
        case 'pdf':
            return '📄';
        case 'doc':
        case 'docx':
            return '📝';
        case 'xls':
        case 'xlsx':
            return '📊';
        case 'ppt':
        case 'pptx':
            return '📽️';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return '🖼️';
        default:
            return '📎';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
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
    const currentSearchValue = document.getElementById('document-search')?.value || '';
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
        const searchInput = document.getElementById('document-search');
        if (searchInput) {
            searchInput.value = currentSearchValue;
            const searchTerm = currentSearchValue.toLowerCase().trim();
            filteredDocuments = allDocuments.filter(doc => 
                doc.fileName.toLowerCase().includes(searchTerm) ||
                doc.uploadedBy.toLowerCase().includes(searchTerm)
            );
        }
    }
    
    // Reapply sorting and display
    applySorting();
    displayDocuments();
    
    // Show success notification
    showNotification('Documents refreshed successfully', 'success');
}

/**
 * Show notification toast
 */
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

// OSA Accounts - Student Activity Tracking

const STORAGE_KEYS = {
    ACCESS_LOG: 'studentAccessLog',
    FORM_SUBMISSIONS: 'formSubmissions'
};

let accessLog = [];
let formSubmissions = [];
let accessCurrentPage = 1;
let accessItemsPerPage = 10;
let submissionCurrentPage = 1;
let submissionItemsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    displayAccessData();
    displaySubmissionData();
});

function loadData() {
    accessLog = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESS_LOG) || '[]');
    formSubmissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORM_SUBMISSIONS) || '[]');
}

function setupEventListeners() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    const accessSearch = document.getElementById('access-search');
    const submissionSearch = document.getElementById('submission-search');
    if (accessSearch) accessSearch.addEventListener('input', displayAccessData);
    if (submissionSearch) submissionSearch.addEventListener('input', displaySubmissionData);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function displayAccessData() {
    const tbody = document.getElementById('access-table-body');
    const searchTerm = document.getElementById('access-search')?.value.toLowerCase() || '';
    
    if (!tbody) return;
    
    const filtered = accessLog.filter(entry =>
        entry.orgName.toLowerCase().includes(searchTerm) ||
        entry.studentName.toLowerCase().includes(searchTerm) ||
        entry.email.toLowerCase().includes(searchTerm)
    ).sort((a, b) => new Date(b.lastAccess) - new Date(a.lastAccess));
    
    const start = (accessCurrentPage - 1) * accessItemsPerPage;
    const end = start + accessItemsPerPage;
    const pageData = filtered.slice(start, end);
    
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = pageData.map(entry => `
        <tr>
            <td><strong>${entry.orgName}</strong></td>
            <td>${entry.studentName}</td>
            <td>${entry.email}</td>
            <td>${formatDateTime(entry.lastAccess)}</td>
            <td>${entry.sessionCount}</td>
            <td><span class="status-badge ${getStatusClass(entry.lastAccess)}">${getStatusText(entry.lastAccess)}</span></td>
        </tr>
    `).join('');
    
    updateAccessPagination(filtered.length);
}

function displaySubmissionData() {
    const tbody = document.getElementById('submission-table-body');
    const searchTerm = document.getElementById('submission-search')?.value.toLowerCase() || '';
    
    if (!tbody) return;
    
    const filtered = formSubmissions.filter(entry =>
        entry.organization.toLowerCase().includes(searchTerm) ||
        entry.formType.toLowerCase().includes(searchTerm) ||
        entry.submittedBy.toLowerCase().includes(searchTerm)
    ).sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    
    const start = (submissionCurrentPage - 1) * submissionItemsPerPage;
    const end = start + submissionItemsPerPage;
    const pageData = filtered.slice(start, end);
    
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No submissions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = pageData.map(entry => `
        <tr>
            <td><strong>${entry.organization}</strong></td>
            <td>${entry.formType}</td>
            <td>${entry.submittedBy}</td>
            <td>${formatDateTime(entry.submissionDate)}</td>
            <td><span class="status-badge status-${entry.status}">${entry.status}</span></td>
            <td><button class="btn-view" onclick="viewSubmission('${entry.id}')">View</button></td>
        </tr>
    `).join('');
    
    updateSubmissionPagination(filtered.length);
}

function viewSubmission(id) {
    const submission = formSubmissions.find(s => s.id === id);
    if (submission) {
        alert(`Form: ${submission.formType}\nOrganization: ${submission.organization}\nSubmitted By: ${submission.submittedBy}\nDate: ${formatDateTime(submission.submissionDate)}\nStatus: ${submission.status}`);
    }
}

function getStatusClass(lastAccess) {
    const hours = (new Date() - new Date(lastAccess)) / (1000 * 60 * 60);
    if (hours < 1) return 'status-online';
    if (hours < 24) return 'status-recent';
    return 'status-inactive';
}

function getStatusText(lastAccess) {
    const hours = (new Date() - new Date(lastAccess)) / (1000 * 60 * 60);
    if (hours < 1) return 'Active';
    if (hours < 24) return 'Recent';
    return 'Inactive';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const diff = new Date() - date;
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateAccessPagination(total) {
    const totalPages = Math.ceil(total / accessItemsPerPage);
    const start = (accessCurrentPage - 1) * accessItemsPerPage;
    
    document.getElementById('access-pagination-info').textContent = 
        total === 0 ? 'Showing 0 of 0 records' : `Showing ${start + 1}-${Math.min(start + accessItemsPerPage, total)} of ${total} records`;
    
    document.getElementById('access-first-page').disabled = accessCurrentPage === 1;
    document.getElementById('access-prev-page').disabled = accessCurrentPage === 1;
    document.getElementById('access-next-page').disabled = accessCurrentPage === totalPages || totalPages === 0;
    document.getElementById('access-last-page').disabled = accessCurrentPage === totalPages || totalPages === 0;
}

function accessGoToPage(page) { accessCurrentPage = page; displayAccessData(); }
function accessNextPage() { accessCurrentPage++; displayAccessData(); }
function accessPreviousPage() { accessCurrentPage--; displayAccessData(); }
function accessGoToLastPage() { 
    accessCurrentPage = Math.ceil(accessLog.length / accessItemsPerPage) || 1; 
    displayAccessData(); 
}
function accessChangeItemsPerPage() {
    accessItemsPerPage = parseInt(document.getElementById('access-items-per-page').value);
    accessCurrentPage = 1;
    displayAccessData();
}

function updateSubmissionPagination(total) {
    const totalPages = Math.ceil(total / submissionItemsPerPage);
    const start = (submissionCurrentPage - 1) * submissionItemsPerPage;
    
    document.getElementById('submission-pagination-info').textContent = 
        total === 0 ? 'Showing 0 of 0 records' : `Showing ${start + 1}-${Math.min(start + submissionItemsPerPage, total)} of ${total} records`;
    
    document.getElementById('submission-first-page').disabled = submissionCurrentPage === 1;
    document.getElementById('submission-prev-page').disabled = submissionCurrentPage === 1;
    document.getElementById('submission-next-page').disabled = submissionCurrentPage === totalPages || totalPages === 0;
    document.getElementById('submission-last-page').disabled = submissionCurrentPage === totalPages || totalPages === 0;
}

function submissionGoToPage(page) { submissionCurrentPage = page; displaySubmissionData(); }
function submissionNextPage() { submissionCurrentPage++; displaySubmissionData(); }
function submissionPreviousPage() { submissionCurrentPage--; displaySubmissionData(); }
function submissionGoToLastPage() { 
    submissionCurrentPage = Math.ceil(formSubmissions.length / submissionItemsPerPage) || 1; 
    displaySubmissionData(); 
}
function submissionChangeItemsPerPage() {
    submissionItemsPerPage = parseInt(document.getElementById('submission-items-per-page').value);
    submissionCurrentPage = 1;
    displaySubmissionData();
}

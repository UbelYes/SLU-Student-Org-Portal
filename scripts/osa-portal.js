// Auth check: verify session with server and populate sessionStorage
function checkAuth() {
    return fetch('/api/logout.php')
        .then(res => res.json())
        .then(data => {
            if (!data.logged_in || data.user.type !== 'osa') {
                window.location.replace('/index.html');
                return false;
            }
            sessionStorage.setItem('userEmail', data.user.email);
            sessionStorage.setItem('userType', data.user.type);
            sessionStorage.setItem('userName', data.user.name);
            return true;
        })
        .catch(() => {
            window.location.replace('/index.html');
            return false;
        });
}

checkAuth();
window.addEventListener('pageshow', (event) => { if (event.persisted) checkAuth(); });

// NAVIGATION & LOGOUT
function handleLogout() {
    fetch('/api/logout.php', { method: 'POST' })
        .then(() => {
            session_unset();
            session_destroy();
            sessionStorage.clear();
            window.location.replace('/index.html');
        })
        .catch(() => window.location.replace('/index.html'));
}

// FORMS MANAGEMENT
let formRecords = [];

document.addEventListener('DOMContentLoaded', () => {
    loadSubmissions();
    setInterval(loadSubmissions, 10000);
});

function loadSubmissions() {
    fetch('/api/read.php')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('.form-table tbody');
            if (data.success && data.records) {
                formRecords = data.records;
                displayForms(data.records);
            }
        });
}

function displayForms(data) {
    const tbody = document.querySelector('.form-table tbody');
    tbody.innerHTML = data.map(record => `
                    <tr>
                        <td>${record.submission_title || ''}</td>
                        <td>${record.org_name || ''}</td>
                        <td>${record.applicant_name || ''}</td>
                        <td>${record.created_at || ''}</td>
                        <td>${record.organization_school || ''}</td>
                        <td>
                            <button onclick="viewPDF(${record.id})" style="padding:5px 10px;margin-right:5px;background:#004080;color:white;border:none;border-radius:4px;cursor:pointer">View</button>
                        </td>
                    </tr>
                `).join('');
}


// DOCUMENTS MANAGEMENT

let allDocuments = [];
function loadDocuments() {
    fetch('/api/read.php')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('documents-table-body');
            if (tbody && data.success && data.records) {
                allDocuments = data.records;
                displayDocuments(data.records);
            }
        });
}

function displayDocuments(data) {
    const tbody = document.getElementById('documents-table-body');
    const withFiles = data.filter(withFile => withFile.file_path);
    tbody.innerHTML = withFiles.map(record => `
                    <tr>
                        <td>${record.org_name || 'Document'}</td>
                        <td>${record.submission_title || ''}</td>
                        <td>${record.organization_school || ''}</td>
                        <td>${record.created_at || ''}</td>
                        <td>${record.file_path || 'N/A'}</td>
                        <td>
                            <button onclick="window.open('/uploads/${record.file_path}', '_blank')" style="padding:5px 10px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer">Open File</button>
                        </td>
                    </tr>
                `).join('');
}

function viewPDF(id) {
    fetch(`/api/read.php?id=${id}`)
        .then(r => r.json())
        .then(data => {
            if (data.success && data.record) {
                const win = window.open('', '_blank');
                win.document.write(generatePDFHTML(data.record));
                win.document.close();
                win.print();
            }
        });
}

function refreshDocuments() {
    loadDocuments();
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Load forms data
    loadSubmissions();
    // Load documents data
    loadDocuments();
});

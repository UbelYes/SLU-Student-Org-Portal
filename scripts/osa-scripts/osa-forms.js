// Keep track of all form cards
let formCards = [];
const CARDS_PER_PAGE = 4;
let currentPage = 1;

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    // Get existing cards
    const existingCards = document.querySelectorAll('.form-card');
    formCards = Array.from(existingCards);
    
    // Set up create form button
    const createFormButton = document.querySelector('.create-form-button');
    createFormButton.addEventListener('click', createNewFormCard);
    
    // Initial pagination setup
    updatePagination();
    showCurrentPage();
});

function createNewFormCard() {
    const newCard = document.createElement('div');
    newCard.className = 'form-card';
    newCard.innerHTML = `
        <div class="form-card-container">
            <div class="form-card-description">
                <div class="card-title"><h3>New Form</h3></div>
                <div class="card-description">
                    Description for the new form goes here.
                </div>
                <div class="field-no">0 fields</div>
            </div>
            <div class="edit-delete">
                <button class="card-edit-button">
                    <img class="edit-icon" src="../resources/icons/edit-icon.svg" />
                    <p>Edit</p>
                </button>
                <button class="card-delete-button">
                    <img class="delete-button" src="../resources/icons/delete-icon.svg" />
                </button>
            </div>
        </div>
    `;

    // Add the new card to our array
    formCards.push(newCard);
    
    // Update pagination and show the last page where the new card is
    updatePagination();
    currentPage = Math.ceil(formCards.length / CARDS_PER_PAGE);
    showCurrentPage();
}

function updatePagination() {
    const totalPages = Math.ceil(formCards.length / CARDS_PER_PAGE);
    const paginationContainer = document.querySelector('.pagination');
    
    // Clear existing pagination
    paginationContainer.innerHTML = '';
    
    // Create pagination buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        if (i === currentPage) {
            pageLink.classList.add('active');
        }
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            showCurrentPage();
            updatePaginationActive();
        });
        paginationContainer.appendChild(pageLink);
    }
}

function updatePaginationActive() {
    const paginationLinks = document.querySelectorAll('.pagination a');
    paginationLinks.forEach((link, index) => {
        if (index + 1 === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function showCurrentPage() {
    const formsContainer = document.querySelector('.forms-list');
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    const end = start + CARDS_PER_PAGE;
    
    // Clear the container
    formsContainer.innerHTML = '';
    
    // Show only cards for current page
    formCards.slice(start, end).forEach(card => {
        formsContainer.appendChild(card.cloneNode(true));
    });
    
    // Update active pagination link
    updatePaginationActive();
}
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}
function initializeModals() {
    document.querySelectorAll('[data-close]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-close');
            closeModal(modalId);
        });
    });
}
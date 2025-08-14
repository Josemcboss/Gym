// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Format date and time for display
function formatDateTime(dateString, timeString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (timeString) {
        const [hours, minutes] = timeString.split(':');
        date.setHours(hours, minutes);
    }
    return date.toLocaleString();
}

// Calculate membership end date
function calculateEndDate(startDate, duration) {
    const date = new Date(startDate + 'T00:00:00');

    switch(duration) {
        case 'mensual':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'trimestral':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'semestral':
            date.setMonth(date.getMonth() + 6);
            break;
        case 'anual':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }

    return date.toISOString().split('T')[0];
}

// Check if a membership is active
function isMembershipActive(startDate, duration) {
    const endDate = new Date(calculateEndDate(startDate, duration));
    return new Date() <= endDate;
}

function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

function showValidationError(element, message) {
    element.classList.add('invalid');
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    element.parentNode.appendChild(errorElement);
}

function clearValidationErrors(form) {
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    form.querySelectorAll('.error-message').forEach(el => el.remove());
}

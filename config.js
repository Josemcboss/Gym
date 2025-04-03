const CONFIG = {
    VERSION: '1.0',
    DATE_FORMAT: 'DD/MM/YYYY',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    CURRENCY: 'DOP'
};

// Función de inicialización
function initializeApp() {
    if (!localStorage.getItem('gymData')) {
        initializeLocalStorage();
    }
    loadInitialData();
    initializeEventListeners();
}
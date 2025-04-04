document.addEventListener('DOMContentLoaded', function () {
    // Inicializar datos si no existen
    if (!localStorage.getItem('gymData')) {
        initializeLocalStorage();
    }

    // Cargar datos en tablas y selects
    loadClientsTable();
    loadMembershipsTable();
    loadAttendanceTable();
    loadExpiringMemberships();
    loadPaymentMembershipSelect();
    loadPaymentsTable();
    loadTrainersTable();
    loadRecentAttendance();

    // Cargar elementos select
    loadClientSelect();
    loadClientMembershipSelect();
    loadTrainerSelect();
    loadMembershipTypeSelect();

    // Actualizar estadísticas del dashboard
    updateDashboardStats();
});
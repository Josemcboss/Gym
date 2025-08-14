document.addEventListener('DOMContentLoaded', function() {
    // Check if local storage has data, otherwise initialize with demo data
    if (!localStorage.getItem('gymData')) {
        initializeLocalStorage(); //
    }
    // Load data into all tables and selects
    loadClientsTable();
    loadMembershipsTable();
    loadAttendanceTable();
    loadExpiringMemberships();
    loadPaymentMembershipSelect();
    loadPaymentsTable();
    loadTrainersTable();
    loadRecentAttendance();

    // Load all select elements
    loadClientSelect();
    loadClientMembershipSelect();
    loadTrainerSelect();
    loadMembershipTypeSelect();
    updateDashboardStats();
    // Show dashboard tab by default
    const dashboardTab = document.querySelector('.tab-btn[data-tab="dashboard"]');
    if (dashboardTab) {
        dashboardTab.click();
    }

    validateAttendanceIds();
});

function validateAttendanceIds() {
    const data = getGymData();
    const ids = data.attendance.map(a => a.id);

    // Verificar si hay IDs duplicados
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
        console.error('IDs duplicados encontrados en asistencias:', duplicates);
        NotificationSystem.error('Error: Se encontraron IDs duplicados en las asistencias. Por favor, revise los datos.');
    }
}

const NotificationSystem = {
    container: null,

    init: function() {
        // Crear el contenedor de notificaciones si no existe
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    },

    show: function(message, type = 'info') {
        this.init();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Agregar al contenedor
        this.container.appendChild(notification);

        // Configurar el botón de cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },

    success: function(message) {
        this.show(message, 'success');
    },

    error: function(message) {
        this.show(message, 'error');
    },

    warning: function(message) {
        this.show(message, 'warning');
    }
};

const BackupSystem = {
    createBackup: function() {
        const data = getGymData();
        const backup = {
            data: data,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(backup)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gym_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    },

    restoreBackup: function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backup = JSON.parse(e.target.result);
                localStorage.setItem('gymData', JSON.stringify(backup.data));
                NotificationSystem.success('Respaldo restaurado exitosamente');
                location.reload();
            } catch (error) {
                NotificationSystem.error('Error al restaurar el respaldo');
            }
        };
        reader.readAsText(file);
    }
};

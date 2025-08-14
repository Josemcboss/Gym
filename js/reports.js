function generateIncomeReport() {
    const dateRange = document.getElementById('income-date-range').value;
    const membershipType = document.getElementById('income-membership-type').value;
    const paymentMethod = document.getElementById('income-payment-method').value;

    const data = getGymData();
    let filteredPayments = data.payments.filter(p => p.status === 'Pagado');

    // Calculate date range
    const today = new Date();
    let startDate, endDate;

    switch(dateRange) {
        case 'day':
            startDate = new Date(today.setHours(0,0,0,0));
            endDate = new Date(today.setHours(23,59,59,999));
            break;
        case 'week':
            startDate = new Date(today.setDate(today.getDate() - today.getDay()));
            endDate = new Date(today.setDate(today.getDate() + 6));
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            break;
    }

    // Apply filters
    filteredPayments = filteredPayments.filter(payment => {
        const paymentDate = new Date(payment.date);
        const matchesDate = paymentDate >= startDate && paymentDate <= endDate;
        const matchesMembership = !membershipType || payment.membership_id.toString() === membershipType;
        const matchesMethod = !paymentMethod || payment.method === paymentMethod;

        return matchesDate && matchesMembership && matchesMethod;
    });

    // Generate report
    const tableBody = document.getElementById('income-report-table');
    tableBody.innerHTML = '';
    let totalIncome = 0;

    if (filteredPayments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No se encontraron pagos para el período seleccionado</td></tr>';
        document.getElementById('income-total').innerHTML = '<strong>$0.00</strong>';
        return;
    }

    filteredPayments.forEach(payment => {
        const client = getClientByCedula(payment.client_cedula);
        const membership = getMembershipById(payment.membership_id);
        const finalAmount = payment.amount * (1 - (payment.discount || 0) / 100);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.client_cedula}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${client ? client.name : 'Cliente no encontrado'}</td>
            <td>${membership ? membership.name : 'Membresía no encontrada'}</td>
            <td>$${payment.amount.toFixed(2)}</td>
            <td>${payment.discount || 0}%</td>
            <td>$${finalAmount.toFixed(2)}</td>
            <td>${payment.method}</td>
            <td>
                <span class="badge badge-success">${payment.status}</span>
            </td>
        `;
        tableBody.appendChild(row);
        totalIncome += finalAmount;
    });

    document.getElementById('income-total').innerHTML = `<strong>$${totalIncome.toFixed(2)}</strong>`;
}

function generateAttendanceReport() {
    const clientId = document.getElementById('attendance-report-client').value;
    const dateFrom = document.getElementById('attendance-report-date-from').value;
    const dateTo = document.getElementById('attendance-report-date-to').value;

    const data = getGymData();
    let filteredAttendance = [...data.attendance];

    // Aplicar filtros
    if (clientId) {
        filteredAttendance = filteredAttendance.filter(a => a.client_cedula === clientId);
    }

    if (dateFrom && dateTo) {
        filteredAttendance = filteredAttendance.filter(a => {
            const attendanceDate = new Date(a.date);
            return attendanceDate >= new Date(dateFrom) &&
                   attendanceDate <= new Date(dateTo);
        });
    }

    // Ordenar por fecha
    filteredAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generar reporte
    const tableBody = document.getElementById('attendance-report-table');
    tableBody.innerHTML = '';

    if (filteredAttendance.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron registros</td></tr>';
        return;
    }

    filteredAttendance.forEach(attendance => {
        const client = getClientByCedula(attendance.client_cedula);
        const trainer = attendance.trainer_id ? getTrainerById(attendance.trainer_id) : null;
        const membership = client ? getMembershipById(client.membership_id) : null;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${attendance.id}</td>
            <td>${formatDateTime(attendance.date, attendance.time)}</td>
            <td>${client ? client.name : 'Cliente no encontrado'}</td>
            <td>${trainer ? trainer.name : 'Sin entrenador'}</td>
            <td>${membership ? membership.name : 'N/A'}</td>
            <td>
                <span class="badge ${attendance.status === 'Confirmada' ? 'badge-success' : 'badge-danger'}">
                    ${attendance.status}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function generateMembershipReport() {
    const status = document.getElementById('membership-report-status').value;
    const type = document.getElementById('membership-report-type').value;

    const data = getGymData();
    let filteredClients = [...data.clients];

    // Aplicar filtros
    filteredClients = filteredClients.filter(client => {
        const membership = getMembershipById(client.membership_id);
        if (!membership) return false;

        const isActive = isMembershipActive(client.start_date, membership.duration);
        const matchesStatus = !status ||
            (status === 'Activo' && isActive) ||
            (status === 'Inactivo' && !isActive);
        const matchesType = !type || membership.id.toString() === type;

        return matchesStatus && matchesType;
    });

    // Generar reporte
    const tableBody = document.getElementById('membership-report-table');
    tableBody.innerHTML = '';

    if (filteredClients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron registros</td></tr>';
        updateMembershipSummary([], [], []);
        return;
    }

    // Separar clientes activos e inactivos
    const activeMemberships = [];
    const inactiveMemberships = [];

    filteredClients.forEach(client => {
        const membership = getMembershipById(client.membership_id);
        const isActive = isMembershipActive(client.start_date, membership.duration);

        // Obtener última asistencia
        const lastAttendance = data.attendance
            .filter(a => a.client_cedula === client.cedula)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (isActive) {
            activeMemberships.push(client);
        } else {
            inactiveMemberships.push(client);
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.cedula}</td>
            <td>${client.name}</td>
            <td>${membership.name}</td>
            <td>${formatDate(client.start_date)}</td>
            <td>
                <span class="badge ${isActive ? 'badge-success' : 'badge-danger'}">
                    ${isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>${lastAttendance ? formatDateTime(lastAttendance.date, lastAttendance.time) : 'Nunca'}</td>
        `;
        tableBody.appendChild(row);
    });

    // Actualizar resumen
    updateMembershipSummary(activeMemberships, inactiveMemberships, filteredClients);
}

function generateTrainerReport() {
    const trainerId = document.getElementById('trainer-report-trainer').value;
    const data = getGymData();

    let filteredTrainers = trainerId ?
        data.trainers.filter(t => t.id.toString() === trainerId) :
        data.trainers;

    const tableBody = document.getElementById('trainer-report-table');
    tableBody.innerHTML = '';

    if (filteredTrainers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron entrenadores</td></tr>';
        return;
    }

    filteredTrainers.forEach(trainer => {
        // Obtener última sesión
        const trainerSessions = data.attendance.filter(a =>
            Number(a.trainer_id) === Number(trainer.id) &&
            a.status === 'Confirmada'
        );

        const lastSession = trainerSessions.length > 0 ?
            trainerSessions.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trainer.cedula}</td>
            <td>${trainer.name}</td>
            <td>${trainer.specialty}</td>
            <td>${trainer.gender === 'M' ? 'Masculino' : 'Femenino'}</td>
            <td>${lastSession ? formatDateTime(lastSession.date, lastSession.time) : 'Sin sesiones'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateMembershipSummary(activeMemberships, inactiveMemberships, filteredClients) {
    try {
        const elements = {
            active: document.getElementById('membership-report-active'),
            inactive: document.getElementById('membership-report-inactive'),
            total: document.getElementById('membership-report-total')
        };

        if (!elements.active || !elements.inactive || !elements.total) {
            console.error('One or more summary elements not found');
            return;
        }

        elements.active.textContent = activeMemberships.length;
        elements.inactive.textContent = inactiveMemberships.length;
        elements.total.textContent = filteredClients.length;
    } catch (error) {
        console.error('Error updating membership summary:', error);
    }
}

function exportReport(type) {
    const tableData = [];
    let filename = '';

    switch(type) {
        case 'attendance':
            const attendanceTable = document.getElementById('attendance-report-table');
            filename = 'reporte_asistencia.csv';
            // Convertir tabla a CSV
            break;
        case 'income':
            const incomeTable = document.getElementById('income-report-table');
            filename = 'reporte_ingresos.csv';
            break;
        case 'membership':
            const membershipTable = document.getElementById('membership-report-table');
            filename = 'reporte_membresias.csv';
            break;
    }

    // Crear y descargar el archivo CSV
    const csvContent = "data:text/csv;charset=utf-8," + tableData.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
}

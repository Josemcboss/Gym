function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function loadClientsTable() {
    const data = getGymData();
    const tableBody = document.getElementById('clients-table');
    tableBody.innerHTML = '';

    data.clients.forEach(client => {
        const membership = getMembershipById(client.membership_id);
        const endDate = calculateEndDate(client.start_date, membership.duration);
        const isActive = isMembershipActive(client.start_date, membership.duration);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.cedula}</td>
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>${membership.name}</td>
            <td>${client.gender === 'M' ? 'Masculino' : 'Femenino'}</td>
            <td>
                <span class="badge ${isActive ? 'badge-success' : 'badge-danger'}">
                    ${isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-primary" onclick="viewClient('${client.cedula}')">Ver</button>
                <button class="btn btn-warning" onclick="editClient('${client.cedula}')">Editar</button>
                <button class="btn btn-danger" onclick="deleteClient('${client.cedula}')">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadMembershipsTable() {
    const data = getGymData();
    const tableBody = document.getElementById('memberships-table');
    tableBody.innerHTML = '';

    data.memberships.forEach(membership => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${membership.id}</td>
            <td>${membership.name}</td>
            <td>${membership.description}</td>
            <td>${membership.duration}</td>
            <td>$${membership.price}</td>
            <td>
                <button class="btn btn-warning" onclick="editMembership(${membership.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteMembership(${membership.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadAttendanceTable() {
    const data = getGymData();
    const tableBody = document.getElementById('attendance-table');
    tableBody.innerHTML = '';

    // Ordenar por fecha más reciente
    const sortedAttendance = [...data.attendance].sort((a, b) => {
        return new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`);
    });

    sortedAttendance.forEach(attendance => {
        const client = getClientByCedula(attendance.client_cedula);
        const trainer = attendance.trainer_id ? getTrainerById(attendance.trainer_id) : null;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${attendance.client_cedula}</td>
            <td>${client ? client.name : 'Cliente no encontrado'}</td>
            <td>${formatDateTime(attendance.date, attendance.time)}</td>
            <td>${trainer ? trainer.name : 'Sin entrenador'}</td>
            <td>
                <span class="badge ${attendance.status === 'Confirmada' ? 'badge-success' : 'badge-danger'}">
                    ${attendance.status}
                </span>
            </td>
            <td>
                <button class="btn btn-warning" onclick="editAttendance(${attendance.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteAttendance(${attendance.id})">Eliminar</button>
                <button class="btn btn-info" onclick="viewAttendanceDetails(${attendance.id})">
                    <i class="bi bi-eye"></i> Ver Detalles
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadPaymentsTable() {
    const data = getGymData();
    const tableBody = document.getElementById('payments-table');
    tableBody.innerHTML = '';

    // Sort payments by date (newest first)
    const sortedPayments = [...data.payments].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    sortedPayments.forEach(payment => {
        const client = payment.client_cedula ? getClientByCedula(payment.client_cedula) : null;
        const membership = payment.membership_id ? getMembershipById(payment.membership_id) : null;
        const finalAmount = payment.amount ? payment.amount * (1 - (payment.discount || 0) / 100) : 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.client_cedula || 'N/A'}</td>
            <td>${client ? client.name : 'Cliente no encontrado'}</td>
            <td>${membership ? membership.name : 'Membresía no encontrada'}</td>
            <td>$${finalAmount.toFixed(2)}</td>
            <td>${payment.method || 'N/A'}</td>
            <td>
                <span class="badge ${payment.status === 'Pagado' ? 'badge-success' :
                                    payment.status === 'Pendiente' ? 'badge-warning' :
                                    'badge-danger'}">
                    ${payment.status || 'Desconocido'}
                </span>
            </td>
            <td>${payment.date ? formatDate(payment.date) : 'N/A'}</td>
            <td>
                <button class="btn btn-warning" onclick="editPayment(${payment.id})">Editar</button>
                <button class="btn btn-danger" onclick="deletePayment(${payment.id})">Eliminar</button>
                <button class="btn btn-info" onclick="viewInvoice(${payment.id})">
                    <i class="bi bi-file-text"></i> Ver Factura
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadTrainersTable() {
    const data = getGymData();
    const tableBody = document.getElementById('trainers-table');
    tableBody.innerHTML = '';

    data.trainers.forEach(trainer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trainer.cedula}</td>
            <td>${trainer.name}</td>
            <td>${trainer.specialty}</td>
            <td>${trainer.gender === 'M' ? 'Masculino' : 'Femenino'}</td>
            <td>${trainer.email}</td>
            <td>${trainer.phone}</td>
            <td>${trainer.schedule || 'No definido'}</td>
            <td>
                <button class="btn btn-warning" onclick="editTrainer(${trainer.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteTrainer(${trainer.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadClientMembershipSelect() {
    const data = getGymData();
    const selectElement = document.getElementById('client-membership');
    selectElement.innerHTML = '<option value="">Seleccionar membresía</option>';

    data.memberships.forEach(membership => {
        const option = document.createElement('option');
        option.value = membership.id;
        option.textContent = `${membership.name} (${membership.duration})`;
        selectElement.appendChild(option);
    });
}

function loadPaymentMembershipSelect() {
    const data = getGymData();
    const selectElement = document.getElementById('payment-membership');
    selectElement.innerHTML = '<option value="">Seleccionar membresía</option>';

    data.memberships.forEach(membership => {
        const option = document.createElement('option');
        option.value = membership.id;
        option.textContent = `${membership.name} ($${membership.price})`;
        selectElement.appendChild(option);
    });
}

function loadClientSelect() {
    const data = getGymData();
    const attendanceClientSelect = document.getElementById('attendance-client');
    const paymentClientSelect = document.getElementById('payment-client');
    const attendanceFilterSelect = document.getElementById('attendance-client-filter');
    const attendanceReportSelect = document.getElementById('attendance-report-client');

    // Limpiar opciones previas
    attendanceClientSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
    paymentClientSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
    attendanceFilterSelect.innerHTML = '<option value="">Todos los clientes</option>';
    attendanceReportSelect.innerHTML = '<option value="">Todos los clientes</option>';

    // Filtrar clientes con membresías activas
    data.clients.forEach(client => {
        const membership = getMembershipById(client.membership_id);
        if (membership && isMembershipActive(client.start_date, membership.duration)) {
            // Agregar cliente al selector de asistencia
            const attendanceOption = document.createElement('option');
            attendanceOption.value = client.cedula;
            attendanceOption.textContent = `${client.cedula} - ${client.name}`;
            attendanceClientSelect.appendChild(attendanceOption);

            // Agregar cliente al selector de pagos
            const paymentOption = document.createElement('option');
            paymentOption.value = client.cedula;
            paymentOption.textContent = `${client.cedula} - ${client.name}`;
            paymentClientSelect.appendChild(paymentOption);

            // Agregar cliente al filtro de asistencia
            const filterOption = document.createElement('option');
            filterOption.value = client.cedula;
            filterOption.textContent = client.name;
            attendanceFilterSelect.appendChild(filterOption);

            // Agregar cliente al reporte de asistencia
            const reportOption = document.createElement('option');
            reportOption.value = client.cedula;
            reportOption.textContent = client.name;
            attendanceReportSelect.appendChild(reportOption);
        }
    });
}

function loadTrainerSelect() {
    const data = getGymData();
    const attendanceTrainerSelect = document.getElementById('attendance-trainer');
    const trainerReportSelect = document.getElementById('trainer-report-trainer');

    // Clear previous options
    attendanceTrainerSelect.innerHTML = '<option value="">Ninguno</option>';
    trainerReportSelect.innerHTML = '<option value="">Todos los entrenadores</option>';

    data.trainers.forEach(trainer => {
        // For attendance trainer select
        const option1 = document.createElement('option');
        option1.value = trainer.id;
        option1.textContent = trainer.name;
        attendanceTrainerSelect.appendChild(option1);

        // For trainer report select
        const option2 = document.createElement('option');
        option2.value = trainer.id;
        option2.textContent = trainer.name;
        trainerReportSelect.appendChild(option2);
    });
}

function loadMembershipTypeSelect() {
    const data = getGymData();
    const incomeSelect = document.getElementById('income-membership-type');
    const membershipReportSelect = document.getElementById('membership-report-type');

    // Clear previous options
    incomeSelect.innerHTML = '<option value="">Todas las membresías</option>';
    membershipReportSelect.innerHTML = '<option value="">Todos los tipos</option>';

    data.memberships.forEach(membership => {
        // For income report select
        const option1 = document.createElement('option');
        option1.value = membership.id;
        option1.textContent = membership.name;
        incomeSelect.appendChild(option1);

        // For membership report select
        const option2 = document.createElement('option');
        option2.value = membership.id;
        option2.textContent = membership.name;
        membershipReportSelect.appendChild(option2);
    });
}

function updateDashboardStats() {
    const data = getGymData();

    // Contar clientes activos
    const activeClients = data.clients.filter(client => {
        const membership = getMembershipById(client.membership_id);
        return membership && isMembershipActive(client.start_date, membership.duration);
    }).length;

    // Contar asistencias hoy
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = data.attendance.filter(a => a.date === today && a.status === 'Confirmada').length;

    // Contar entrenadores
    const trainersCount = data.trainers.length;

    // Calcular ingresos mensuales
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyIncome = data.payments
        .filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate.getMonth() + 1 === currentMonth &&
                   paymentDate.getFullYear() === currentYear &&
                   p.status === 'Pagado';
        })
        .reduce((sum, p) => sum + (p.amount * (1 - p.discount / 100)), 0);

    // Actualizar los valores en el dashboard
    document.getElementById('active-clients-count').textContent = activeClients;
    document.getElementById('today-attendance-count').textContent = todayAttendance;
    document.getElementById('trainers-count').textContent = trainersCount;
    document.getElementById('monthly-income').textContent = `$${monthlyIncome.toFixed(2)}`;
}

function loadExpiringMemberships() {
    const data = getGymData();
    const tableBody = document.getElementById('expiring-memberships');
    tableBody.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar fecha
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    // Obtener y procesar membresías
    const expiringMemberships = data.clients
        .map(client => {
            const membership = getMembershipById(client.membership_id);
            if (!membership || !client.start_date) return null;

            const endDate = new Date(calculateEndDate(client.start_date, membership.duration));
            endDate.setHours(0, 0, 0, 0);

            return { client, membership, endDate };
        })
        .filter(Boolean) // Eliminar nulos
        .filter(item => item.endDate >= today && item.endDate <= nextWeek)
        .sort((a, b) => a.endDate - b.endDate); // Ordenar por fecha más próxima

    // Mostrar resultados
    if (expiringMemberships.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay membresías por vencer en la próxima semana</td></tr>`;
        return;
    }

    expiringMemberships.forEach(({client, membership, endDate}) => {
        const row = document.createElement('tr');
        const daysLeft = Math.ceil((endDate - today) / (86400000)); // 1 día en ms

        // Resaltar si vence hoy
        if (daysLeft === 0) {
            row.classList.add('urgent-expiration');
        }

        row.innerHTML = `
            <td>${client.cedula || 'N/A'}</td>
            <td>${client.name || 'Sin nombre'}</td>
            <td>${membership.name} (${membership.duration})</td>
            <td>
                ${formatDate(endDate)}
                <span class="expiration-badge ${
                    daysLeft <= 1 ? 'bg-danger-light' : 'bg-warning-light'
                }">
            </td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="renewMembership('${client.cedula}')">
                    Renovar
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="sendReminder('${client.cedula}')">
                    <i class="bi bi-envelope"></i> Recordatorio
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadRecentAttendance() {
    const data = getGymData();
    const tableBody = document.getElementById('recent-attendance');
    tableBody.innerHTML = '';

    // Ordenar por fecha más reciente primero
    const sortedAttendance = [...data.attendance].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
    }).slice(0, 10); // Mostrar solo las 10 más recientes

    if (sortedAttendance.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay registros de asistencia recientes</td></tr>`;
        return;
    }

    sortedAttendance.forEach(attendance => {
        const client = getClientByCedula(attendance.client_cedula);
        const trainer = attendance.trainer_id ? getTrainerById(attendance.trainer_id) : null;
        const attendanceDate = new Date(`${attendance.date}T${attendance.time}`);

        // Calcular tiempo transcurrido
        const now = new Date();
        const hoursDiff = Math.floor((now - attendanceDate) / (1000 * 60 * 60));

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${attendance.client_cedula}</td>
            <td>${client ? client.name : 'Cliente no encontrado'}</td>
            <td>
                ${formatDateTime(attendance.date, attendance.time)}
                ${hoursDiff < 24 ? `<span class="badge bg-success">Hoy</span>` : ''}
            </td>
            <td>${trainer ? trainer.name : 'Sin entrenador'}</td>
            <td>
                <span class="badge ${
                    attendance.status === 'Confirmada' ? 'bg-success' : 'bg-danger'
                }">
                    ${attendance.status}
                </span>
            </td>
            <td>
                <button class="btn btn-outline-primary btn-sm" onclick="viewAttendanceDetails(${attendance.id})">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

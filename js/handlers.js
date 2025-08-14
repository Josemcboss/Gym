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

document.getElementById('payment-membership').addEventListener('change', function () {
    const membershipId = parseInt(this.value);
    const membership = getMembershipById(membershipId);

    if (membership) {
        document.getElementById('payment-amount').value = membership.price;
    } else {
        document.getElementById('payment-amount').value = '';
    }
});

document.getElementById('payment-client').addEventListener('change', function() {
    const cedula = this.value;
    const client = getClientByCedula(cedula);

    if (client) {
        // Actualizar el nombre del cliente
        document.getElementById('payment-client-name').value = client.name;

        // Obtener la membresía actual del cliente
        const membership = getMembershipById(client.membership_id);
        if (membership) {
            // Seleccionar la membresía en el select
            document.getElementById('payment-membership').value = membership.id;

            // Establecer el monto basado en el precio de la membresía
            document.getElementById('payment-amount').value = membership.price;
        } else {
            document.getElementById('payment-membership').value = '';
            document.getElementById('payment-amount').value = '';
        }
    } else {
        // Limpiar campos si no se encuentra el cliente
        document.getElementById('payment-client-name').value = '';
        document.getElementById('payment-membership').value = '';
        document.getElementById('payment-amount').value = '';
    }
});

document.getElementById('trainer-phone').addEventListener('input', function(e) {
    // Remove any non-numeric characters
    this.value = this.value.replace(/[^0-9]/g, '');

    // Limit to 10 digits
    if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
    }
});

document.getElementById('client-form').addEventListener('submit', function (e) {
    e.preventDefault();
    clearValidationErrors(this);

    const data = getGymData();
    const cedula = document.getElementById('client-cedula');
    const name = document.getElementById('client-name');
    const email = document.getElementById('client-email');
    const phone = document.getElementById('client-phone');
    const birthdate = document.getElementById('client-birthdate');
    const gender = document.getElementById('client-gender');
    const membershipId = document.getElementById('client-membership');
    const startDate = document.getElementById('client-start-date');

    let isValid = true;

    if (cedula.value.length !== 11 || !/^\d+$/.test(cedula.value)) {
        showValidationError(cedula, 'La cédula debe tener 11 dígitos numéricos.');
        isValid = false;
    }

    if (phone.value.length !== 10 || !/^\d+$/.test(phone.value)) {
        showValidationError(phone, 'El teléfono debe tener 10 dígitos numéricos.');
        isValid = false;
    }

    if (name.value.trim() === '') {
        showValidationError(name, 'El nombre es obligatorio.');
        isValid = false;
    }

    if (!validateEmail(email.value)) {
        showValidationError(email, 'El correo electrónico no es válido.');
        isValid = false;
    }

    if (membershipId.value === '') {
        showValidationError(membershipId, 'Debe seleccionar una membresía.');
        isValid = false;
    }

    if (startDate.value === '') {
        showValidationError(startDate, 'La fecha de inicio es obligatoria.');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const isEditing = !!document.getElementById('client-modal-title').textContent.includes('Editar');
    const currentCedula = isEditing ? document.getElementById('client-cedula').dataset.originalCedula : null;

    // Verificar si la cédula ya existe en entrenadores
    const trainerWithCedula = data.trainers.find(t => t.cedula === cedula.value);
    if (trainerWithCedula) {
        NotificationSystem.error('Esta cédula ya está registrada para un entrenador. Por favor, use una cédula diferente.');
        return;
    }

    // Verificar si ya existe un cliente con la misma cédula (excluyendo el cliente actual si está editando)
    const existingClient = data.clients.find(client => client.cedula === cedula.value && client.cedula !== currentCedula);
    if (existingClient) {
        NotificationSystem.error('Ya existe un cliente con esta cédula. Por favor, verifica los datos.');
        return;
    }

    if (isEditing) {
        // Actualizar cliente existente
        const clientIndex = data.clients.findIndex(client => client.cedula === currentCedula);
        if (clientIndex !== -1) {
            data.clients[clientIndex] = {
                cedula: cedula.value,
                name: name.value,
                email: email.value,
                phone: phone.value,
                birthdate: birthdate.value,
                gender: gender.value,
                membership_id: membershipId.value,
                start_date: startDate.value
            };
        }
    } else {
        // Crear un nuevo cliente
        const newClient = {
            cedula: cedula.value,
            name: name.value,
            email: email.value,
            phone: phone.value,
            birthdate: birthdate.value,
            gender: gender.value,
            membership_id: membershipId.value,
            start_date: startDate.value
        };
        data.clients.push(newClient);
    }

    saveGymData(data);
    loadClientsTable();
    loadClientSelect();
    closeModal('client-modal');
    this.reset();
});

document.getElementById('membership-form').addEventListener('submit', function(event) {
    event.preventDefault();
    clearValidationErrors(this);

    const data = getGymData();
    const membershipId = document.getElementById('membership-id').value;
    const name = document.getElementById('membership-name');
    const price = document.getElementById('membership-price');

    let isValid = true;

    if (name.value.trim() === '') {
        showValidationError(name, 'El nombre es obligatorio.');
        isValid = false;
    }

    if (price.value === '' || parseFloat(price.value) <= 0) {
        showValidationError(price, 'El precio debe ser un número positivo.');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const membership = {
        name: name.value,
        description: document.getElementById('membership-description').value,
        duration: document.getElementById('membership-duration').value,
        price: parseFloat(price.value)
    };

    if (membershipId) {
        // Update existing membership
        membership.id = parseInt(membershipId);
        const index = data.memberships.findIndex(m => m.id === membership.id);
        if (index !== -1) {
            data.memberships[index] = membership;
        }
    } else {
        // Add new membership
        membership.id = generateUniqueId('memberships');
        data.memberships.push(membership);
    }

    saveGymData(data);
    loadMembershipsTable();
    loadClientMembershipSelect();
    loadPaymentMembershipSelect();
    loadMembershipTypeSelect();
    updateDashboardStats();
    closeModal('membership-modal');
    this.reset();
    document.getElementById('membership-id').value = '';
});

document.getElementById('attendance-form').addEventListener('submit', function(event) {
    event.preventDefault();
    clearValidationErrors(this);

    const data = getGymData();
    const attendanceId = document.getElementById('attendance-id').value;
    const cedula = document.getElementById('attendance-client');
    const date = document.getElementById('attendance-date');
    const time = document.getElementById('attendance-time');
    const trainerId = document.getElementById('attendance-trainer');
    const status = document.getElementById('attendance-status');

    let isValid = true;

    if (cedula.value === '') {
        showValidationError(cedula, 'Debe seleccionar un cliente.');
        isValid = false;
    }

    if (date.value === '') {
        showValidationError(date, 'La fecha es obligatoria.');
        isValid = false;
    }

    if (time.value === '') {
        showValidationError(time, 'La hora es obligatoria.');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Validar que el cliente existe
    const client = getClientByCedula(cedula.value);
    if (!client) {
        NotificationSystem.error('Cliente no encontrado');
        return;
    }

    // Validar membresía activa
    const membership = getMembershipById(client.membership_id);
    if (!membership || !isMembershipActive(client.start_date, membership.duration)) {
        if (!confirm('El cliente no tiene una membresía activa. ¿Desea registrar la asistencia de todos modos?')) {
            return;
        }
    }

    // Crear nueva asistencia
    const newAttendance = {
        id: attendanceId ? Number(attendanceId) : generateUniqueId('attendance'),
        client_cedula: cedula.value,
        date: date.value,
        time: time.value,
        trainer_id: trainerId.value ? Number(trainerId.value) : null,
        status: status.value
    };
    console.log('Nueva asistencia con ID:', newAttendance.id);
    // Si es edición, actualizar el registro existente
    if (attendanceId) {
        // Actualizar asistencia existente
        const index = data.attendance.findIndex(a => Number(a.id) === Number(attendanceId));
        if (index !== -1) {
            data.attendance[index] = newAttendance;
        }
    } else {
        // Verificar que el ID no esté duplicado
        const isDuplicate = data.attendance.some(a => Number(a.id) === Number(newAttendance.id));
        if (isDuplicate) {
            console.error('ID duplicado detectado:', newAttendance.id);
            NotificationSystem.error('Error en la generación de ID. Por favor, intente nuevamente.');
            return;
        }

        // Agregar nueva asistencia
        data.attendance.push(newAttendance);
    }

    // Guardar cambios
    saveGymData(data);

    // Actualizar UI
    loadAttendanceTable();
    loadRecentAttendance();
    updateDashboardStats();

    // Cerrar modal y limpiar formulario
    closeModal('attendance-modal');
    this.reset();
    document.getElementById('attendance-id').value = '';

    // Mostrar mensaje de éxito
    NotificationSystem.success('Asistencia registrada correctamente');
});

document.getElementById('trainer-form').addEventListener('submit', function(event) {
    event.preventDefault();
    clearValidationErrors(this);

    const data = getGymData();
    const trainerId = document.getElementById('trainer-id');
    const cedula = document.getElementById('trainer-cedula');
    const name = document.getElementById('trainer-name');
    const specialty = document.getElementById('trainer-specialty');
    const gender = document.getElementById('trainer-gender');
    const email = document.getElementById('trainer-email');
    const phone = document.getElementById('trainer-phone');
    const schedule = document.getElementById('trainer-schedule');

    let isValid = true;

    if (cedula.value.length !== 11 || !/^\d+$/.test(cedula.value)) {
        showValidationError(cedula, 'La cédula debe tener 11 dígitos numéricos.');
        isValid = false;
    }

    if (name.value.trim() === '') {
        showValidationError(name, 'El nombre es obligatorio.');
        isValid = false;
    }

    if (specialty.value === '') {
        showValidationError(specialty, 'Debe seleccionar una especialidad.');
        isValid = false;
    }

    if (gender.value === '') {
        showValidationError(gender, 'Debe seleccionar un género.');
        isValid = false;
    }

    if (!validateEmail(email.value)) {
        showValidationError(email, 'El correo electrónico no es válido.');
        isValid = false;
    }

    if (phone.value.length !== 10 || !/^\d+$/.test(phone.value)) {
        showValidationError(phone, 'El teléfono debe tener 10 dígitos numéricos.');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const originalCedula = document.getElementById('trainer-cedula').dataset.originalCedula;

    // Verificar si es una edición o un nuevo registro
    const isEditing = !!trainerId.value;

    // Verificar si la cédula ya existe en otros entrenadores
    const existingTrainer = data.trainers.find(t =>
        t.cedula === cedula.value &&
        (!isEditing || t.id !== Number(trainerId.value))
    );

    if (existingTrainer) {
        NotificationSystem.error('Ya existe un entrenador con esta cédula. Por favor, use una cédula diferente.');
        return;
    }

    // Verificar si la cédula ya existe en clientes
    const clientWithCedula = data.clients.find(c => c.cedula === cedula.value);
    if (clientWithCedula) {
        NotificationSystem.error('Esta cédula ya está registrada para un cliente. Por favor, use una cédula diferente.');
        return;
    }

    const trainer = {
        cedula: cedula.value,
        name: name.value,
        specialty: specialty.value,
        gender: gender.value,
        email: email.value,
        phone: phone.value,
        schedule: schedule.value
    };

    if (isEditing) {
        // Actualizar entrenador existente
        trainer.id = Number(trainerId.value);
        const index = data.trainers.findIndex(t => Number(t.id) === Number(trainer.id));
        if (index !== -1) {
            data.trainers[index] = trainer;
        }
    } else {
        // Agregar nuevo entrenador
        trainer.id = generateUniqueId('trainers');
        data.trainers.push(trainer);
    }

    saveGymData(data);
    loadTrainersTable();
    loadTrainerSelect();
    closeModal('trainer-modal');
    this.reset();
    document.getElementById('trainer-id').value = '';

    NotificationSystem.success('Entrenador guardado correctamente');
});

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-close') || event.target.hasAttribute('data-close')) {
        const modalId = event.target.getAttribute('data-close');
        closeModal(modalId);
    }
});

document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        const tab = this.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(tab).classList.add('active');
    });
});

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        if (this.getAttribute('data-page') === 'dashboard') {
            updateDashboardStats();
        }
        // Ocultar todas las páginas
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });


        // Obtener el atributo "data-page" del elemento clickeado
        const pageId = this.getAttribute('data-page') + '-page';

        // Mostrar la página seleccionada
        document.getElementById(pageId).style.display = 'block';

        // Cambiar el título de la página
        document.getElementById('page-title').innerText = this.innerText;

        // Remover la clase 'active' de todos los elementos y agregarla al actual
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

document.getElementById('add-trainer-btn').addEventListener('click', function() {
    // Limpiar el formulario antes de abrir el modal
    document.getElementById('trainer-form').reset();
    document.getElementById('trainer-id').value = '';
    document.getElementById('trainer-modal-title').textContent = 'Agregar Entrenador';

    // Abrir el modal
    openModal('trainer-modal');
});

document.getElementById('add-client-btn').addEventListener('click', function() {
    // Reinicia el formulario para limpiar datos anteriores
    document.getElementById('client-form').reset();
    // Establece la fecha actual en formato yyyy-mm-dd
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    document.getElementById('client-start-date').value = formattedToday;
    // Cambia el título del modal a "Agregar Cliente"
    document.getElementById('client-modal-title').textContent = 'Agregar Cliente';
    // Abre el modal
    openModal('client-modal');
});

document.getElementById('add-membership-btn') && document.getElementById('add-membership-btn').addEventListener('click', function() {
    document.getElementById('membership-form').reset();
    document.getElementById('membership-modal-title').textContent = 'Agregar Membresía';
    openModal('membership-modal');
});

document.getElementById('add-attendance-btn') && document.getElementById('add-attendance-btn').addEventListener('click', function() {
    document.getElementById('attendance-form').reset();
    document.getElementById('attendance-modal-title').textContent = 'Registrar Asistencia';
    // Asigna la fecha actual (formato YYYY-MM-DD)
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;

    // Asigna la hora actual en formato HH:MM
    var now = new Date();
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('attendance-time').value = hours + ':' + minutes;
    openModal('attendance-modal');
});

document.getElementById('add-payment-btn') && document.getElementById('add-payment-btn').addEventListener('click', function() {
    document.getElementById('payment-form').reset();
    document.getElementById('payment-modal-title').textContent = 'Registrar Pago';

    // Establecer fecha actual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('payment-date').value = today;

    openModal('payment-modal');
});

document.getElementById('attendance-client').addEventListener('change', function() {
    const cedula = this.value;
    const client = getClientByCedula(cedula);
    const clientNameInput = document.getElementById('attendance-client-name');

    if (client) {
        clientNameInput.value = client.name;
        // Verificar si la membresía está activa
        const membership = getMembershipById(client.membership_id);
        if (!isMembershipActive(client.start_date, membership.duration)) {
            NotificationSystem.warning('Advertencia: Este cliente no tiene una membresía activa');
        }
    } else {
        clientNameInput.value = '';
        if (cedula) {
            NotificationSystem.error('Cliente no encontrado');
        }
    }
});

document.getElementById('search-client').addEventListener('input', searchClients);
document.getElementById('search-client-cedula').addEventListener('input', searchClients);

document.getElementById('search-client-cedula').addEventListener('input', function(e) {
    // Eliminar caracteres no numéricos
    this.value = this.value.replace(/[^0-9]/g, '');

    // Limitar a 11 caracteres
    if (this.value.length > 11) {
        this.value = this.value.slice(0, 11);
    }
});

document.getElementById('client-phone').addEventListener('input', function(e) {
    // Remove any non-numeric characters
    this.value = this.value.replace(/[^0-9]/g, '');

    // Limit to 10 digits
    if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
    }
});

document.getElementById('client-name').addEventListener('input', function () {
    const length = this.value.length;
    const counter = document.getElementById('client-name-count');
    const warning = document.getElementById('client-name-warning');
    counter.textContent = `${length} / 50`;

    if (length >= 45) {
        counter.style.color = 'red';
    } else {
        counter.style.color = '';
    }

    warning.style.display = length === 50 ? 'inline' : 'none';
});

document.getElementById('client-email').addEventListener('input', function () {
    const length = this.value.length;
    const counter = document.getElementById('client-email-count');
    const warning = document.getElementById('client-email-warning');
    counter.textContent = `${length} / 75`;

    if (length >= 68) {
        counter.style.color = 'red';
    } else {
        counter.style.color = '';
    }

    warning.style.display = length === 75 ? 'inline' : 'none';
});

document.getElementById('client-cedula').addEventListener('input', function () {
    const maxLength = 11;
    const currentLength = this.value.length;
    const countElement = document.getElementById('client-cedula-count');
    const warningElement = document.getElementById('client-cedula-warning');

    countElement.textContent = `${currentLength} / ${maxLength}`;
    countElement.style.color = currentLength >= maxLength - 2 ? 'red' : '';
    warningElement.style.display = currentLength === maxLength ? 'inline' : 'none';
});

document.getElementById('client-phone').addEventListener('input', function () {
    const maxLength = 10;
    const currentLength = this.value.length;
    const countElement = document.getElementById('client-phone-count');
    const warningElement = document.getElementById('client-phone-warning');

    countElement.textContent = `${currentLength} / ${maxLength}`;
    countElement.style.color = currentLength >= maxLength - 2 ? 'red' : '';
    warningElement.style.display = currentLength === maxLength ? 'inline' : 'none';
});

document.getElementById('trainer-cedula').addEventListener('input', function () {
  this.value = this.value.replace(/[^0-9]/g, ''); // Solo números

  if (this.value.length > 11) {
    this.value = this.value.slice(0, 11); // Limita a 11
  }

  const length = this.value.length;
  const counter = document.getElementById('trainer-cedula-count');
  const warning = document.getElementById('trainer-cedula-warning');

  counter.textContent = `${length} / 11`;
  counter.style.color = length >= 10 ? 'red' : '';
  warning.style.display = length === 11 ? 'inline' : 'none';
});

document.getElementById('trainer-name').addEventListener('input', function () {
  this.value = this.value.replace(/[0-9]/g, ''); // Eliminar números

  if (this.value.length > 50) {
    this.value = this.value.slice(0, 50); // Limita a 50
  }

  const length = this.value.length;
  const counter = document.getElementById('trainer-name-count');
  const warning = document.getElementById('trainer-name-warning');

  counter.textContent = `${length} / 50`;
  counter.style.color = length >= 45 ? 'red' : '';
  warning.style.display = length === 50 ? 'inline' : 'none';
});

document.getElementById('trainer-email').addEventListener('input', function () {
  if (this.value.length > 75) {
    this.value = this.value.slice(0, 75); // Limita a 75
  }

  const length = this.value.length;
  const counter = document.getElementById('trainer-email-count');
  const warning = document.getElementById('trainer-email-warning');

  counter.textContent = `${length} / 75`;
  counter.style.color = length >= 70 ? 'red' : '';
  warning.style.display = length === 75 ? 'inline' : 'none';
});

document.getElementById('trainer-phone').addEventListener('input', function () {
  this.value = this.value.replace(/[^0-9]/g, ''); // Solo números

  if (this.value.length > 10) {
    this.value = this.value.slice(0, 10); // Limita a 10
  }

  const length = this.value.length;
  const counter = document.getElementById('trainer-phone-count');
  const warning = document.getElementById('trainer-phone-warning');

  counter.textContent = `${length} / 10`;
  counter.style.color = length >= 9 ? 'red' : '';
  warning.style.display = length === 10 ? 'inline' : 'none';
});

document.getElementById('trainer-schedule').addEventListener('input', function () {
  if (this.value.length > 50) {
    this.value = this.value.slice(0, 50); // Limita a 50
  }

  const length = this.value.length;
  const counter = document.getElementById('trainer-schedule-count');
  const warning = document.getElementById('trainer-schedule-warning');

  counter.textContent = `${length} / 50`;
  counter.style.color = length >= 45 ? 'red' : '';
  warning.style.display = length === 50 ? 'inline' : 'none';
});

document.getElementById('payment-form').addEventListener('submit', function(event) {
    event.preventDefault();
    clearValidationErrors(this);

    const data = getGymData();
    const clientId = document.getElementById('payment-client');
    const membershipId = document.getElementById('payment-membership');
    const amount = document.getElementById('payment-amount');
    const discount = document.getElementById('payment-discount');
    const method = document.getElementById('payment-method');
    const status = document.getElementById('payment-status');
    const date = document.getElementById('payment-date');

    let isValid = true;

    if (clientId.value === '') {
        showValidationError(clientId, 'Debe seleccionar un cliente.');
        isValid = false;
    }

    if (membershipId.value === '') {
        showValidationError(membershipId, 'Debe seleccionar una membresía.');
        isValid = false;
    }

    if (amount.value === '' || parseFloat(amount.value) <= 0) {
        showValidationError(amount, 'El monto debe ser un número positivo.');
        isValid = false;
    }

    if (discount.value !== '' && (parseFloat(discount.value) < 0 || parseFloat(discount.value) > 100)) {
        showValidationError(discount, 'El descuento debe estar entre 0 y 100.');
        isValid = false;
    }

    if (method.value === '') {
        showValidationError(method, 'Debe seleccionar un método de pago.');
        isValid = false;
    }

    if (status.value === '') {
        showValidationError(status, 'Debe seleccionar un estado.');
        isValid = false;
    }

    if (date.value === '') {
        showValidationError(date, 'La fecha es obligatoria.');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Validar que exista el cliente y tenga membresía activa
    const client = getClientByCedula(clientId.value);
    if (!client) {
        NotificationSystem.error('El cliente seleccionado no existe');
        return;
    }

    // Validar que el monto coincida con el precio de la membresía
    const membership = getMembershipById(membershipId.value);
    if (!membership) {
        NotificationSystem.error('La membresía seleccionada no existe');
        return;
    }

    if (parseFloat(amount.value) !== membership.price) {
        if (!confirm('El monto ingresado no coincide con el precio de la membresía. ¿Desea continuar?')) {
            return;
        }
    }

    // Crear objeto de pago con ID único
    const payment = {
        id: generateUniqueId('payments'),
        client_cedula: clientId.value,
        membership_id: parseInt(membershipId.value),
        amount: parseFloat(amount.value),
        discount: parseFloat(discount.value) || 0,
        method: method.value,
        status: status.value,
        date: date.value
    };

    console.log('Nuevo pago con ID:', payment.id); // Para debug

    data.payments.push(payment);
    saveGymData(data);

    // Actualizar UI
    loadPaymentsTable();
    updateDashboardStats();

    // Cerrar modal y resetear formulario
    closeModal('payment-modal');
    this.reset();
});

document.getElementById('filter-payments-btn').addEventListener('click', function() {
    const dateFrom = document.getElementById('payment-date-from').value;
    const dateTo = document.getElementById('payment-date-to').value;
    const status = document.getElementById('payment-status-filter').value;

    filterPayments(dateFrom, dateTo, status);
});

document.getElementById('filter-attendance-btn').addEventListener('click', function() {
    const dateFrom = document.getElementById('attendance-date-from').value;
    const dateTo = document.getElementById('attendance-date-to').value;
    const clientId = document.getElementById('attendance-client-filter').value;

    filterAttendance(dateFrom, dateTo, clientId);
});

document.getElementById('generate-income-report').addEventListener('click', generateIncomeReport);
document.getElementById('generate-attendance-report').addEventListener('click', generateAttendanceReport);
document.getElementById('generate-membership-report').addEventListener('click', generateMembershipReport);
document.getElementById('generate-trainer-report').addEventListener('click', generateTrainerReport);

document.getElementById('payment-discount').addEventListener('input', function() {
    // Remover caracteres no numéricos
    this.value = this.value.replace(/[^0-9]/g, '');

    // Limitar a 3 caracteres
    if (this.value.length > 3) {
        this.value = this.value.slice(0, 3);
    }

    // Validar que no sea mayor a 100
    if (parseInt(this.value) > 100) {
        this.value = '100';
    }
});

document.getElementById('payment-discount').addEventListener('keypress', function(e) {
    // Permitir solo números
    if (!/^\d*$/.test(e.key)) {
        e.preventDefault();
    }

    // Prevenir entrada si ya hay 3 caracteres y no es tecla de borrar o similar
    if (this.value.length >= 3 && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        e.preventDefault();
    }
});

document.getElementById('client-email').addEventListener('input', function() {
    const isValid = validateEmail(this.value);
    this.classList.toggle('invalid', !isValid && this.value.length > 0);
});

document.getElementById('backup-btn').addEventListener('click', function() {
    BackupSystem.createBackup();
});

document.getElementById('restore-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        BackupSystem.restoreBackup(file);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Get all phone input fields
    const phoneInputs = ['client-phone', 'trainer-phone'];

    phoneInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function(e) {
                // Remove any non-numeric characters
                this.value = this.value.replace(/\D/g, '');

                // Limit to 10 digits
                if (this.value.length > 10) {
                    this.value = this.value.slice(0, 10);
                }
            });

            // Prevent key press of non-numeric characters
            input.addEventListener('keypress', function(e) {
                if (!/^\d*$/.test(e.key)) {
                    e.preventDefault();
                }
            });
        }
    });
});

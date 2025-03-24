function getGymData() {
    return JSON.parse(localStorage.getItem("gymData")) || {
        clients: [],
        trainers: [],
        memberships: [],
        attendance: [],
        payments: [],
        counters: { clients: 0, trainers: 0, memberships: 0, attendance: 0, payments: 0 }
    };

}


function saveGymData(data) {
    localStorage.setItem("gymData", JSON.stringify(data));
}
function generateId(entity) {
    let data = getGymData();
    if (!data.counters[entity]) {
        data.counters[entity] = 1;
    } else {
        data.counters[entity]++;
    }
    saveGymData(data);
    return data.counters[entity];
}
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
        document.getElementById(this.getAttribute('data-page') + "-page").style.display = 'block';
        document.getElementById('page-title').innerText = this.innerText;
    });
});

document.addEventListener("DOMContentLoaded", function() {
    loadClientsTable();
    loadPaymentsTable();
    loadAttendanceTable();
    loadMembershipsTable();  // Asegúrate de llamar a esta función para cargar las membresías
    loadMembershipsInSelect();  // Para cargar las opciones de membresía en los formularios
});

document.getElementById("add-client-btn").addEventListener("click", function() {
    openModal("client-modal");
    loadMembershipsInSelect();
});

document.getElementById("client-form").addEventListener("submit", function(event) {
    event.preventDefault();
    let name = document.getElementById("client-name").value;
    if (name.trim() === "") {
        alert("El nombre no puede estar vacío");
        return;
    }
    // Guardar cliente en localStorage
});

document.querySelectorAll('.modal-close').forEach(button => {
    button.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

document.getElementById("client-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que la página se recargue
    
    let data = getGymData(); // Obtiene los datos almacenados

    // Crear un nuevo cliente
    let client = {
        id: generateId("clients"),
        name: document.getElementById("client-name").value,
        email: document.getElementById("client-email").value,
        phone: document.getElementById("client-phone").value,
        birthdate: document.getElementById("client-birthdate").value,
        gender: document.getElementById("client-gender").value,
        membership_id: parseInt(document.getElementById("client-membership").value),
        start_date: document.getElementById("client-start-date").value
    };

    data.clients.push(client); // Agregar cliente al array
    saveGymData(data); // Guardar en `localStorage`

    loadClientsTable(); // Actualizar la tabla de clientes
    updateDashboardCounts(); // Actualizar el contador del Dashboard

    closeModal("client-modal"); // Cerrar el modal
    this.reset(); // Limpiar el formulario
});

function loadClientsTable() {
    let data = getGymData();
    let tableBody = document.getElementById("clients-table");
    tableBody.innerHTML = "";

    // Verifica si hay clientes
    if (data.clients.length === 0) {
        // Si no hay clientes, muestra un mensaje o deja la tabla vacía
        tableBody.innerHTML = "<tr><td colspan='6'>No hay clientes disponibles.</td></tr>";
    } else {
        data.clients.forEach(client => {
            let membership = getMembershipById(client.membership_id); // Obtener la membresía por ID
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${client.id}</td>
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>${membership ? membership.name : 'Sin Membresía'}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteClient(${client.id})">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateDashboardCounts(); // Refrescar los contadores
}



function updateDashboardCounts() {
    let data = getGymData();
    document.getElementById("active-clients-count").innerText = data.clients.length; // Actualizar el contador de clientes
    document.getElementById("trainers-count").innerText = data.trainers.length; // Actualizar el contador de entrenadores (si aplica)
    document.getElementById("memberships-count").innerText = data.memberships.length; // Actualizar el contador de membresías (si aplica)
    document.getElementById("attendance-count").innerText = data.attendance.length; // Actualizar el contador de asistencia
    document.getElementById("payments-count").innerText = data.payments.length; // Actualizar el contador de pagos (si aplica)
}



function deleteClient(clientId) {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

    let data = getGymData();
    console.log("Clientes antes de eliminar:", data.clients);

    data.clients = data.clients.filter(client => client.id !== clientId); // Eliminar el cliente
    console.log("Clientes después de eliminar:", data.clients);

    saveGymData(data); // Guardar los datos actualizados en localStorage

    loadClientsTable(); // Actualizar la tabla
    updateDashboardCounts(); // Actualizar los contadores del Dashboard
}


// Membresías
document.getElementById("add-membership-btn").addEventListener("click", function() {
    document.getElementById("membership-form").reset(); // Limpiar formulario
    document.getElementById("membership-id").value = ""; // Resetear ID oculto
    document.getElementById("membership-modal-title").innerText = "Agregar Membresía";
    openModal("membership-modal");
});

document.getElementById("membership-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar recarga de la página

    let data = getGymData();  // Obtener los datos del gimnasio

    let membership = {
        id: generateId("memberships"),
        name: document.getElementById("membership-name").value.trim(),
        description: document.getElementById("membership-description").value.trim(),
        duration: document.getElementById("membership-duration").value,
        price: parseFloat(document.getElementById("membership-price").value)
    };

    // Validación de datos
    if (membership.name === "" || isNaN(membership.price) || membership.price <= 0) {
        alert("Por favor, complete los campos correctamente.");
        return;
    }

    data.memberships.push(membership);  // Agregar la nueva membresía
    saveGymData(data);  // Guardar los datos actualizados en localStorage

    loadMembershipsTable();  // Recargar la tabla de membresías
    updateDashboardCounts();  // Actualizar los contadores del dashboard

    closeModal("membership-modal");  // Cerrar el modal
    this.reset();  // Limpiar el formulario
});
// Cargar la Tabla de Membresías
function loadMembershipsTable() {
    let data = getGymData();  // Obtener datos del gimnasio desde localStorage
    let tableBody = document.getElementById("memberships-table");  // Obtener el cuerpo de la tabla

    tableBody.innerHTML = "";  // Limpiar el contenido de la tabla

    data.memberships.forEach(membership => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${membership.id}</td>
            <td>${membership.name}</td>
            <td>${membership.description}</td>
            <td>${membership.duration}</td>
            <td>$${membership.price}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteMembership(${membership.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updateDashboardCounts();  // Actualizar los contadores del dashboard
}


// Cargar membresias en el select
function loadMembershipsInSelect() {
    let data = getGymData(); // Obtener los datos del gimnasio desde el localStorage
    let membershipSelect = document.getElementById("client-membership"); // Obtener el select por su ID
    
    // Limpiar el select actual
    membershipSelect.innerHTML = ""; 

    // Crear una opción por defecto
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar membresía";
    membershipSelect.appendChild(defaultOption);

    // Si hay membresías disponibles, agregar cada una al select
    if (data.memberships.length > 0) {
        data.memberships.forEach(membership => {
            let option = document.createElement("option");
            option.value = membership.id;
            option.textContent = membership.name;
            membershipSelect.appendChild(option);
        });
    } else {
        // Si no hay membresías, agregar un mensaje que indique que no hay
        let noDataOption = document.createElement("option");
        noDataOption.disabled = true;
        noDataOption.textContent = "No hay membresías disponibles";
        membershipSelect.appendChild(noDataOption);
    }
}


// Obtener membresias por ID
function getMembershipById(id) {
    let data = getGymData();
    return data.memberships.find(membership => membership.id === id);
}

// eliminar membresias
function deleteMembership(membershipId) {
    // Verificar si la membresía está asignada a algún cliente
    let data = getGymData();
    let clientUsingMembership = data.clients.some(client => client.membership_id === membershipId);

    if (clientUsingMembership) {
        alert("No se puede eliminar esta membresía porque está asignada a un cliente.");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar esta membresía?")) return;

    data.memberships = data.memberships.filter(membership => membership.id !== membershipId);
    saveGymData(data);

    loadMembershipsTable(); // Actualizar la tabla
    updateDashboardCounts(); // Actualizar Dashboard
}


//Asistencia
document.getElementById("add-attendance-btn").addEventListener("click", function() {
    openModal("attendance-modal");
});

function loadClientsInSelect() {
    let data = getGymData(); // Obtener datos desde localStorage
    let clientSelect = document.getElementById("attendance-client");

    data.clients.forEach(client => {
        let option = document.createElement("option");
        option.value = client.id; // El ID del cliente
        option.textContent = client.name; // Nombre del cliente
        clientSelect.appendChild(option);
    });
}

function loadTrainersInSelect() {
    let data = getGymData(); // Obtener datos desde localStorage
    let trainerSelect = document.getElementById("attendance-trainer");

    data.trainers.forEach(trainer => {
        let option = document.createElement("option");
        option.value = trainer.id; // El ID del entrenador
        option.textContent = trainer.name; // Nombre del entrenador
        trainerSelect.appendChild(option);
    });
}

document.getElementById("add-attendance-btn").addEventListener("click", function() {
    openModal("attendance-modal");
    loadClientsInSelect(); // Cargar clientes
    loadTrainersInSelect(); // Cargar entrenadores
});


document.getElementById("attendance-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que la página se recargue
    
    let data = getGymData(); // Obtener los datos almacenados en localStorage
    
    // Crear nueva entrada de asistencia
    let attendance = {
        id: generateId("attendance"),
        client_id: parseInt(document.getElementById("attendance-client").value),
        date: document.getElementById("attendance-date").value,
        time: document.getElementById("attendance-time").value,
        trainer_id: parseInt(document.getElementById("attendance-trainer").value),
        status: document.getElementById("attendance-status").value
    };
    
    data.attendance.push(attendance); // Agregar nueva asistencia al array
    saveGymData(data); // Guardar en localStorage

    loadAttendanceTable(); // Actualizar la tabla de asistencia
    updateDashboardCounts(); // Actualizar el Dashboard

    closeModal("attendance-modal"); // Cerrar el modal
    this.reset(); // Limpiar el formulario
});

function loadAttendanceTable() {
    let data = getGymData(); // Obtener los datos de asistencia desde localStorage
    let tableBody = document.getElementById("attendance-table");
    tableBody.innerHTML = ""; // Limpiar la tabla actual

    // Recorrer las asistencias y agregarlas a la tabla
    data.attendance.forEach(attendance => {
        let client = data.clients.find(client => client.id === attendance.client_id);
        let trainer = data.trainers.find(trainer => trainer.id === attendance.trainer_id);
        
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${attendance.id}</td>
            <td>${client ? client.name : 'Desconocido'}</td>
            <td>${attendance.date}</td>
            <td>${attendance.time}</td>
            <td>${trainer ? trainer.name : 'Sin Entrenador'}</td>
            <td>${attendance.status}</td>
        `;
        tableBody.appendChild(row);
    });

    updateDashboardCounts(); // Actualizar los contadores
}
document.getElementById('add-trainer-btn').addEventListener('click', function() {
    // Limpiar el formulario antes de abrir el modal
    document.getElementById('trainer-form').reset();
    document.getElementById('trainer-id').value = '';
    document.getElementById('trainer-modal-title').textContent = 'Agregar Entrenador';
    
    // Abrir el modal
    openModal('trainer-modal');
});
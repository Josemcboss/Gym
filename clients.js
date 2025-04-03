// Load clients table
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

// Obtiene un cliente por su cédula
function getClientByCedula(cedula) {
    const data = getGymData();
    if (!cedula && cedula !== 0) return null;
    return data.clients.find(client => 
        client.cedula.toString() === cedula.toString()
    );
}

// Edit client
function editClient(cedula) {
    const data = getGymData();
    const client = data.clients.find(c => c.cedula === cedula);
    
    if (client) {
        // Set modal title
        document.getElementById('client-modal-title').textContent = 'Editar Cliente';
        
        // Fill form with client data
        document.getElementById('client-cedula').value = client.cedula;
        document.getElementById('client-cedula').dataset.originalCedula = client.cedula;
        document.getElementById('client-name').value = client.name;
        document.getElementById('client-email').value = client.email;
        document.getElementById('client-phone').value = client.phone;
        document.getElementById('client-birthdate').value = client.birthdate;
        document.getElementById('client-gender').value = client.gender;
        document.getElementById('client-membership').value = client.membership_id;
        document.getElementById('client-start-date').value = client.start_date;
        
        // Show modal
        openModal('client-modal');
    }
}

// Delete client
function deleteClient(cedula) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        const data = getGymData();
        data.clients = data.clients.filter(c => c.cedula !== cedula);
        saveGymData(data);
        loadClientsTable();
        loadClientSelect();
        updateDashboardStats();
    }
}
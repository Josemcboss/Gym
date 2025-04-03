      // Load memberships table
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
    // Obtiene una membresía por su ID
function getMembershipById(id) {
    const data = getGymData();
    return data.memberships.find(membership => membership.id == id);
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
        


// Verifica si una membresía está activa
function isMembershipActive(startDate, duration) {
    const endDate = new Date(calculateEndDate(startDate, duration));
    return new Date() <= endDate;
}

// Edit membership
function editMembership(membershipId) {
    const data = getGymData();
    const membership = data.memberships.find(m => m.id === membershipId);
    
    if (membership) {
        // Set modal title
        document.getElementById('membership-modal-title').textContent = 'Editar Membresía';
        
        // Fill form with membership data
        document.getElementById('membership-id').value = membership.id;
        document.getElementById('membership-name').value = membership.name;
        document.getElementById('membership-description').value = membership.description;
        document.getElementById('membership-duration').value = membership.duration;
        document.getElementById('membership-price').value = membership.price;
        
        // Show modal
        openModal('membership-modal');
    }
}

// Delete membership
function deleteMembership(membershipId) {
    // Check if membership is being used by any client
    const data = getGymData();
    const clientUsingMembership = data.clients.some(c => c.membership_id === membershipId);
    
    if (clientUsingMembership) {
        alert('No se puede eliminar esta membresía porque está siendo utilizada por al menos un cliente.');
        return;
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar esta membresía?')) {
        data.memberships = data.memberships.filter(m => m.id !== membershipId);
        saveGymData(data);
        loadMembershipsTable();
        loadClientMembershipSelect();
        loadPaymentMembershipSelect();
        loadMembershipTypeSelect();
    }
}
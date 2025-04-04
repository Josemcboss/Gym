     // Load attendance history
     const attendanceTable = document.getElementById('client-attendance-table');
    attendanceTable.innerHTML = '';
    
    const clientAttendance = data.attendance
        .filter(a => a.client_cedula === client.cedula)
        .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));

    if (clientAttendance.length === 0) {
        attendanceTable.innerHTML = '<tr><td colspan="4" class="text-center">No hay registros de asistencia</td></tr>';
    } else {
        clientAttendance.forEach(attendance => {
            const trainer = attendance.trainer_id ? getTrainerById(attendance.trainer_id) : null;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${attendance.client_cedula}</td>
                <td>${formatDateTime(attendance.date, attendance.time)}</td>
                <td>${trainer ? trainer.name : 'Sin entrenador'}</td>
                <td>
                    <span class="badge ${attendance.status === 'Confirmada' ? 'badge-success' : 'badge-danger'}">
                        ${attendance.status}
                    </span>
                </td>
            `;
            attendanceTable.appendChild(row);
        });
    }

    // Edit attendance
    function editAttendance(attendanceId) {
        const data = getGymData();
        const attendance = data.attendance.find(a => a.id === attendanceId);
        
        if (attendance) {
            document.getElementById('attendance-modal-title').textContent = 'Editar Asistencia';
            document.getElementById('attendance-id').value = attendance.id;
            document.getElementById('attendance-client').value = attendance.client_cedula;
            document.getElementById('attendance-date').value = attendance.date;
            document.getElementById('attendance-time').value = attendance.time;
            document.getElementById('attendance-trainer').value = attendance.trainer_id || '';
            document.getElementById('attendance-status').value = attendance.status;
            
            // Actualizar el nombre del cliente
            const client = getClientByCedula(attendance.client_cedula);
            if (client) {
                document.getElementById('attendance-client-name').value = client.name;
            }
            
            openModal('attendance-modal');
        }
    }
        // Delete attendance
        function deleteAttendance(attendanceId) {
            if (confirm('¿Estás seguro de que deseas eliminar este registro de asistencia?')) {
                const data = getGymData();
                data.attendance = data.attendance.filter(a => a.id !== attendanceId);
                saveGymData(data);
                loadAttendanceTable();
                
                // Also refresh the attendance filter if it's active
                const clientFilter = document.getElementById('attendance-client-filter').value;
                if (clientFilter) {
                    filterAttendanceByClient(clientFilter);
                }
            }
        }

        // Filter attendance by client
function filterAttendanceByClient(clientId) {
    const data = getGymData();
    const tableBody = document.getElementById('attendance-table');
    tableBody.innerHTML = '';
    
    let filteredAttendance = data.attendance;
    
    if (clientId) {
        // Fix: Use clientId parameter instead of undefined cedula variable
        filteredAttendance = data.attendance.filter(a => 
            a.client_cedula.toString() === clientId.toString()
        );
    }
    
    // Sort by date (newest first)
    filteredAttendance.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
    });
    
    filteredAttendance.forEach(attendance => {
        const client = getClientByCedula(attendance.client_cedula);
        const trainer = attendance.trainer_id ? getTrainerById(attendance.trainer_id) : null;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${attendance.client_cedula}</td>
            <td>${client ? client.name : 'Cliente eliminado'}</td>
            <td>${formatDateTime(attendance.date, attendance.time)}</td>
            <td>${trainer ? trainer.name : 'Ninguno'}</td>
            <td>
                <span class="badge ${attendance.status === 'Confirmada' ? 'badge-success' : 'badge-danger'}">
                    ${attendance.status}
                </span>
            </td>
            <td>
                <button class="btn btn-warning" onclick="editAttendance(${attendance.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteAttendance(${attendance.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
// ...existing code...

function loadPaymentsTable() {
    const data = getGymData();
    const tableBody = document.getElementById('payments-table');
    
    if (!tableBody) {
        console.error('Elemento payments-table no encontrado');
        return;
    }

    tableBody.innerHTML = '';
    
    if (data.payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay pagos registrados</td></tr>';
        return;
    }

    // Ordenar pagos por fecha (más recientes primero)
    const sortedPayments = [...data.payments].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sortedPayments.forEach(payment => {
        const client = getClientByCedula(payment.client_cedula);
        const membership = getMembershipById(payment.membership_id);
        const finalAmount = payment.amount * (1 - (payment.discount || 0) / 100);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.client_cedula}</td>
            <td>${client ? client.name : 'Cliente no encontrado'}</td>
            <td>${membership ? membership.name : 'Membresía no encontrada'}</td>
            <td>$${payment.amount.toFixed(2)}</td>
            <td>${payment.discount ? payment.discount + '%' : '0%'}</td>
            <td>$${finalAmount.toFixed(2)}</td>
            <td>${payment.method}</td>
            <td>
                <span class="badge ${
                    payment.status === 'Pagado' ? 'badge-success' : 
                    payment.status === 'Pendiente' ? 'badge-warning' : 'badge-danger'
                }">
                    ${payment.status}
                </span>
            </td>
            <td>${formatDate(payment.date)}</td>
            <td>
                <button class="btn btn-warning" onclick="editPayment(${payment.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-danger" onclick="deletePayment(${payment.id})">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-primary" onclick="generateInvoice(${payment.id})">
                    <i class="bi bi-file-text"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addPayment(paymentData) {
    try {
        // Validar datos requeridos
        const requiredFields = ['client_cedula', 'membership_id', 'amount', 'method', 'date'];
        for (const field of requiredFields) {
            if (!paymentData[field]) {
                throw new Error(`El campo ${field} es requerido`);
            }
        }

        const data = getGymData();
        
        // Validar que el cliente existe
        const client = getClientByCedula(paymentData.client_cedula);
        if (!client) {
            throw new Error('Cliente no encontrado');
        }

        // Validar que la membresía existe
        const membership = getMembershipById(paymentData.membership_id);
        if (!membership) {
            throw new Error('Membresía no encontrada');
        }

        // Crear nuevo pago
        const newPayment = {
            id: generateId('payments'),
            client_cedula: paymentData.client_cedula,
            membership_id: paymentData.membership_id,
            amount: parseFloat(paymentData.amount),
            discount: paymentData.discount ? parseFloat(paymentData.discount) : 0,
            method: paymentData.method,
            status: paymentData.status || 'Pagado',
            date: paymentData.date,
            notes: paymentData.notes || '',
            created_at: new Date().toISOString()
        };

        // Actualizar fecha de inicio de membresía del cliente si es necesario
        if (paymentData.updateMembership) {
            client.start_date = paymentData.date;
            client.membership_id = paymentData.membership_id;
        }

        // Guardar cambios
        data.payments.push(newPayment);
        saveGymData(data);

        // Actualizar UI
        loadPaymentsTable();
        updateDashboardStats();
        
        return newPayment;
    } catch (error) {
        console.error('Error al agregar pago:', error);
        throw error;
    }
}

function filterPayments() {
    const dateFrom = document.getElementById('payment-date-from').value;
    const dateTo = document.getElementById('payment-date-to').value;
    const status = document.getElementById('payment-status-filter').value;
    
    const data = getGymData();
    let filteredPayments = [...data.payments];
    
    if (dateFrom && dateTo) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        fromDate.setHours(0,0,0,0);
        toDate.setHours(23,59,59,999);
        
        filteredPayments = filteredPayments.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= fromDate && paymentDate <= toDate;
        });
    }
    
    if (status) {
        filteredPayments = filteredPayments.filter(payment => payment.status === status);
    }
    
    updatePaymentsTable(filteredPayments);
}

function validateDateRange(fromDate, toDate) {
    if (!fromDate || !toDate) return true;
    
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    if (start > end) {
        alert('La fecha inicial no puede ser mayor que la fecha final');
        return false;
    }
    
    return true;
}

// Ejemplo de uso de addPayment
try {
    const paymentData = {
        client_cedula: "12345678901",
        membership_id: 1,
        amount: 1000,
        method: "Efectivo",
        date: "2025-04-03",
        updateMembership: true
    };
    
    const newPayment = addPayment(paymentData);
    NotificationSystem.success('Pago registrado exitosamente');
} catch (error) {
    NotificationSystem.error(error.message);
}
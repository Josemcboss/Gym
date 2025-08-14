function initializeLocalStorage() {
    // Check if we already have data in localStorage
    if (!localStorage.getItem('gymData')) {
        // Create initial data structure
        const initialData = {
            clients: [{
                id: 1,
                cedula: "123456789",
                name: "Cliente Demo",
                email: "cliente@demo.com",
                phone: "1234567890",
                membership_id: 1,
                start_date: "2025-01-01"
            }],
                    trainers: [],
                    memberships: [
                        {
                            id: 1,
                            name: 'Básica Mensual',
                            description: 'Acceso a todas las instalaciones en horario regular',
                            duration: 'mensual',
                            price: 1390
                        },
                        {
                            id: 2,
                            name: 'Premium Trimestral',
                            description: 'Acceso ilimitado a todas las instalaciones y clases grupales',
                            duration: 'trimestral',
                            price: 3500
                        },
                        {
                            id: 3,
                            name: 'Gold Anual',
                            description: 'Acceso VIP con entrenador personal y nutricionista',
                            duration: 'anual',
                            price: 14999
                        }
                    ],
                    attendance: [],
                    payments: [],
                    counters: {
                        clients: 0,
                        trainers: 0,
                        attendance: 0,
                        payments: 0
                    }
                };

                // Save to localStorage
                localStorage.setItem('gymData', JSON.stringify(initialData));
            }
        }

        function getGymData() {
    const data = JSON.parse(localStorage.getItem('gymData'));

    // Verificar que `data` existe y tiene la estructura correcta
    if (!data || typeof data !== 'object') {
        console.error("Error: gymData no está definido o tiene un formato incorrecto.");
        return {
            clients: [],
            trainers: [],
            memberships: [],
            attendance: [],
            payments: [],
            counters: { clients: 0, trainers: 0, attendance: 0, payments: 0 }
        };
    }
    if (!Array.isArray(data.payments)) {
        console.warn("Advertencia: `payments` no es un array. Se inicializa vacío.");
        data.payments = [];
        saveGymData(data);
    }

    return data;
}

function saveGymData(data) {
    localStorage.setItem('gymData', JSON.stringify(data));
}

function generateUniqueId(entity) {
    const data = getGymData();
    let maxId = 0;

    if (data[entity] && data[entity].length > 0) {
        maxId = data[entity].reduce((max, item) => {
            const itemId = Number(item.id);
            return itemId > max ? itemId : max;
        }, 0);
    }

    return maxId + 1;
}

function getGymData() {
    return JSON.parse(localStorage.getItem('gymData')) || {
        clients: [],
        trainers: [],
        memberships: [],
        attendance: [],
        payments: [],
        counters: {
            clients: 0,
            trainers: 0,
            attendance: 0,
            payments: 0
        }
    };
}

function saveGymData(data) {
    localStorage.setItem('gymData', JSON.stringify(data));
}

function generateId(entity) {
    const data = getGymData();
    if (!data.counters[entity]) {
        data.counters[entity] = 1;
    } else {
        data.counters[entity]++;
    }
    saveGymData(data);
    return data.counters[entity];
}
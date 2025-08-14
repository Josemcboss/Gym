// Fix the getClientByCedula function
function getClientByCedula(cedula) {
    const data = getGymData();

    // Return null if cedula is null/undefined/empty
    if (!cedula) {
        return null;
    }

    // Convert cedula to string for comparison
    const searchCedula = cedula.toString();

    // Find and return client
    return data.clients.find(client => {
        // Handle case where client.cedula might be null/undefined
        if (!client.cedula) return false;
        return client.cedula.toString() === searchCedula;
    });
}

// Get membership by ID
function getMembershipById(id) {
    const data = getGymData();
    return data.memberships.find(membership => membership.id === parseInt(id));
}

// Get trainer by ID
function getTrainerById(id) {
    const data = getGymData();
    return data.trainers.find(trainer => trainer.id === parseInt(id));
}

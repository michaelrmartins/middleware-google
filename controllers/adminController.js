const googleAdminService = require('../services/googleAdminService');

async function listAllUsersController(req, res) {

    // --- DEBUG LOGS ---
console.log('--- DEBUGGING FOR listAllUsersController ---');
console.log('ADMIN_EMAIL lido do ambiente:', process.env.ADMIN_EMAIL);
console.log('DOMAIN_EMAIL lido do ambiente:', process.env.DOMAIN_EMAIL);
console.log('------------------------------------');
    try {
        const domain = process.env.DOMAIN_EMAIL; 

        const users = await googleAdminService.listAllUsers(domain);
        
        console.log(`${users.length} usuários encontrados.`);
        res.status(200).json(users);

    } catch (error) {
        console.error('Erro no controlador ao listar usuários:', error.message);
        res.status(500).json({ message: 'Erro ao listar usuários do Google Workspace', error: error.errors });
    }
}

module.exports = {
    listAllUsersController
};
const googleAdminService = require('../../../../services/googleAdminService');

async function listAllUsersController(req, res) {

    // --- DEBUG LOGS ---
console.log('--- DEBUGGING FOR listAllUsersController ---');
console.log('ADMIN_EMAIL from environmnet:', process.env.ADMIN_EMAIL);
console.log('DOMAIN_EMAIL from environment:', process.env.DOMAIN_EMAIL);
console.log('------------------------------------');
    try {
        const domain = process.env.DOMAIN_EMAIL; 

        const users = await googleAdminService.listAllUsers(domain);
        
        console.log(`${users.length} users found:`);
        res.status(200).json(users);

    } catch (error) {
        console.error('Controller listAllUsersController error:', error.message);
        res.status(500).json({ message: 'List users error.', error: error.errors });
    }
}

async function createNewUserController(req, res){
    try {
        const { primaryEmail, password, givenName, familyName, orgUnitPath, changePasswordAtNextLogin } = req.body;
        console.log('Request body:', req.body);
        const newUser = await googleAdminService.createUser({primaryEmail, password, givenName, familyName, orgUnitPath, changePasswordAtNextLogin});
        
        res.status(201).json(newUser);

    } catch (error) {
        console.error('Controller createNewUserController error:', error.message);
        res.status(500).json({ message: 'Create user error.', error: error.errors });
    }   
}

module.exports = {
    listAllUsersController,
    createNewUserController
};
const googleAdminService = require('../../../services/googleAdminService');
const redis = require('../../../config/redisClient');

const CACHE_TTL_EMAIL_LIST  = 120; // 2 minutes
const CACHE_TTL_EMAIL_INFOS = 30;  // 30 seconds

async function listAllUsersController(req, res) {
    try {
        const domain = process.env.DOMAIN_EMAIL;
        const cacheKey = `email-list:${domain}`;

        const cached = await redis.get(cacheKey).catch(() => null);
        if (cached) {
            console.log(`Cache hit: ${cacheKey}`);
            return res.status(200).json(JSON.parse(cached));
        }

        const users = await googleAdminService.listAllUsers(domain);
        console.log(`${users.length} users found:`);

        redis.set(cacheKey, JSON.stringify(users), 'EX', CACHE_TTL_EMAIL_LIST).catch(() => null);

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
        res.status(500).json({ message: 'Create user error - ' +  error.message, error: error.errors });
    }   
}

async function suspendUserController(req, res){
    try {
        const { userEmail } = req.body;
        console.log('User key to suspend:', userEmail);
        const suspendedUser = await googleAdminService.suspendUser({userEmail});
        
        res.status(200).json(suspendedUser);

    } catch (error) {
        console.error('Controller suspendUserController error:', error.message);
        res.status(500).json({ message: 'Suspend user error.', error: error.errors });
    }   
}

async function reactivateUserController(req, res){
    try {
        const { userEmail } = req.body;
        console.log('User key to reactivate:', userEmail);
        const reactivatedUser = await googleAdminService.reactivateUser({userEmail});
        
        res.status(200).json(reactivatedUser);

    } catch (error) {
        console.error('Controller reactivateUserController error:', error.message);
        res.status(500).json({ message: 'Reactivate user error.', error: error.errors });
    }   
}

async function getUserInfosController(req, res){
    try {
        const { userEmail } = req.body;
        console.log('User key to get infos:', userEmail);
        const cacheKey = `email-infos:${userEmail}`;

        const cached = await redis.get(cacheKey).catch(() => null);
        if (cached) {
            console.log(`Cache hit: ${cacheKey}`);
            return res.status(200).json(JSON.parse(cached));
        }

        const getUserInfos = await googleAdminService.getUserInfos({userEmail});

        redis.set(cacheKey, JSON.stringify(getUserInfos), 'EX', CACHE_TTL_EMAIL_INFOS).catch(() => null);

        res.status(200).json(getUserInfos);

    } catch (error) {
        console.error('Controller getUserInfosController error:', error.message);
        res.status(500).json({ message: 'Get user infos error.', error: error.errors });
    }
}

async function getDriveUserInfosController(req, res){
    try {
        const { userEmail } = req.body;
        console.log('User key to get infos:', userEmail);
        const getDriveUserInfos = await googleAdminService.getDriveUserInfos({userEmail});
        
        res.status(200).json(getDriveUserInfos);

    } catch (error) {
        console.error('Controller getDriveUserInfosController error:', error.message);
        res.status(500).json({ message: 'Get drive user infos error.', error: error.errors });
    }   
}

async function resetUserPasswordController(req, res){
    try {
        const { userEmail, newPassword } = req.body;
        // console.log('User email to reset password:', userEmail);
        const resetResponse = await googleAdminService.resetUserPassword({userEmail, newPassword});
        
        res.status(200).json(resetResponse);

    } catch (error) {
        console.error('Controller resetUserPasswordController error:', error.message);
        res.status(500).json({ message: 'Reset user password error.', error: error.errors });
    }   

}

module.exports = {
    listAllUsersController,
    createNewUserController,
    suspendUserController,
    reactivateUserController,
    getUserInfosController,
    getDriveUserInfosController,
    resetUserPasswordController
};
// services/googleAdminService.js

const { google } = require('googleapis');
const path = require('path');
const { generatePassword } = require('../utils/passwordGenerator');

// --- DEBUG LOGS ---
console.log('--- DEBUGGING FOR GOOGLE ADMIN SERVICE ---');
console.log('ADMIN_EMAIL from environment:', process.env.ADMIN_EMAIL);
console.log('DOMAIN_EMAIL from environment:', process.env.DOMAIN_EMAIL);
console.log('------------------------------------');

const ADMIN_EMAIL_TO_IMPERSONATE = process.env.ADMIN_EMAIL;

const SCOPES = [
    'https://www.googleapis.com/auth/admin.directory.user',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
];

const CREDENTIALS_PATH = path.join(process.cwd(), 'google-credentials.json');

if (!ADMIN_EMAIL_TO_IMPERSONATE) {
    throw new Error('ADMIN_EMAIL is not present in environment variables');
}

if (!process.env.DOMAIN_EMAIL) {
    throw new Error('DOMAIN_EMAIL is not present in environment variables');
}

// AUTH
const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
    clientOptions: { 
        subject: ADMIN_EMAIL_TO_IMPERSONATE,
        timeout: 30000,
    },
});

// Admin instance
const admin = google.admin({ 
    version: 'directory_v1', 
    auth,
    timeout: 30000,
    retry: true,
});

/**
 * Helper function to handle Google API errors
 */
function handleGoogleAPIError(error, operation) {
    console.error(`Operation Error ${operation}:`, {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.response?.data
    });
    
    // Error handler messages
    if (error.code === 403) {
        if (error.message.includes('Not Authorized')) {
            throw new Error(`Not Authorized ${operation}. Check Admin SDK for ${ADMIN_EMAIL_TO_IMPERSONATE}`);
        } else if (error.message.includes('insufficient')) {
            throw new Error(`Permissions error for ${operation}. Check Admin Console delegation.`);
        }
    } else if (error.code === 400) {
        throw new Error(`Invalid request ${operation}: ${error.message}`);
    } else if (error.code === 404) {
        throw new Error(`Resource not found for ${operation}: ${error.message}`);
    }
    
    throw error;
}

/**
 * List all workspace users in the domain
 * @param {string} domain - 
 * @returns {Promise<Array>}
 */
async function listAllUsers(domain) {
    console.log(`Getting all domains users: ${domain}`);
    
    try {
        const response = await admin.users.list({
            domain: domain,
            maxResults: 500,
            orderBy: 'email',
        });

        const users = response.data.users || [];
        console.log(`Found ${users.length} users`);
        return users;
        
    } catch (error) {
        handleGoogleAPIError(error, 'listAllUsers');
    }
}

/**
 * Create new user Service
 * @param {Object} userData
 * @returns {Promise<Object>} 
 */
async function createUser(userData) {
    console.log(`Service received data: ${userData.primaryEmail}`);
    const { primaryEmail, password, givenName, familyName, orgUnitPath, changePasswordAtNextLogin } = userData;
    
    console.log(`Creating new user: ${primaryEmail}`);
    const mustChangePassword = changePasswordAtNextLogin === 'true' || changePasswordAtNextLogin === true;
    try {
        if (!primaryEmail || !password || !givenName || !familyName || !orgUnitPath || !changePasswordAtNextLogin) {
            throw new Error('User data is not complete: primaryEmail, password, givenName, familyName, orgUnitPath and changePasswordAtNextLogin are necessary');
        }
        
        const response = await admin.users.insert({
            requestBody: {
                primaryEmail,
                password,
                name: { 
                    givenName, 
                    familyName,
                    fullName: `${givenName} ${familyName}`
                },
                orgUnitPath: orgUnitPath,
                changePasswordAtNextLogin: mustChangePassword,
            },
        });
        
        console.log(`User ${primaryEmail} created sucessfully`);
        return response.data;
        
    } catch (error) {
        handleGoogleAPIError(error, `createUser (${primaryEmail})`);
    }
}

/**
 * Suspend user Service
 * @param {string} userEmail
 * @returns {Promise<Object>}
 */
async function suspendUser(userEmailReceived) {
    const { userEmail } = userEmailReceived || '';
    console.log(`Suspend user: ${userEmail}`);
    
    try {
        if (!userEmail) {
            throw new Error('User email is required');
        }
        
        await admin.users.update({
            userKey: userEmail,
            requestBody: { suspended: true },
        });
        
        console.log(`User ${userEmail} was suspended sucessfully`);
        return { message: `User ${userEmail} was suspended sucessfully.` };
        
    } catch (error) {
        handleGoogleAPIError(error, `suspendUser (${userEmail})`);
    }
}

/**
 * Activate user Service
 * @param {string} userEmail
 * @returns {Promise<Object>}
 */
async function reactivateUser(userEmailReceived) {
    const { userEmail } = userEmailReceived || '';
    console.log(`User: ${userEmail}`);
    
    try {
        if (!userEmail) {
            throw new Error('User email is required');
        }
        
        await admin.users.update({
            userKey: userEmail,
            requestBody: { suspended: false },
        });
        
        console.log(`User ${userEmail} sucessfully reactivated`);
        return { message: `User ${userEmail} sucessfully reactivated.` };
        
    } catch (error) {
        handleGoogleAPIError(error, `reactivateUser (${userEmail})`);
    }
}

/**
 * Resets a user's password.
 * @param {object} resetData
 * @returns {Promise<Object>}
 */
async function resetUserPassword(resetData) {
    const { userEmail } = resetData;
    console.log(`Resetting password for user: ${userEmail}`);

    try {
        if (!userEmail) {
            throw new Error('User email are required for reset.');
        }
        // Generate a new password
        const newPassword = generatePassword(12);

        await admin.users.update({
            userKey: userEmail,
            requestBody: {
                password: newPassword,
                changePasswordAtNextLogin: true,
            },
        });

        console.log(`Password for user ${userEmail} was reset successfully.`);
        return { message: `Password for user ${userEmail} was reset successfully.`,
                 newPassword: newPassword};

    } catch (error) {
        handleGoogleAPIError(error, `resetUserPassword (${userEmail})`);
    }
}

/**
 * Get user infos Service
 * @param {string} userEmail
 * @returns {Promise<Object>}
 */
async function getUserInfos(userEmailReceived) {
    const { userEmail } = userEmailReceived || '';
    console.log(`User: ${userEmail}`);
    
    try {
        if (!userEmail) {
            throw new Error('User email is required');
        }
        
       const userInfos =  await admin.users.get({
            userKey: userEmail
        });
        
        console.log(`User ${userEmail} - Data sucessfully received`);
        console.log(userInfos);
        return userInfos;
        
    } catch (error) {
        handleGoogleAPIError(error, `reactivateUser (${userEmail})`);
    }
}

/**
 * Connection test function
 * @returns {Promise<boolean>} - true = sucess, false = failure
 */
async function testConnection() {
    console.log('Testing Google API Connection...');
    
    try {
        const response = await admin.users.list({
            domain: process.env.DOMAIN_EMAIL,
            maxResults: 1,
        });
        
        console.log('Connection successful!');
        console.log(`Domain: ${process.env.DOMAIN_EMAIL}`);
        console.log(`Admin: ${ADMIN_EMAIL_TO_IMPERSONATE}`);
        console.log(`Return: ${response.data.users?.length || 0}`);
        
        return true;
        
    } catch (error) {
        console.log('Connection Error:');
        handleGoogleAPIError(error, 'testConnection');
        return false;
    }
}

module.exports = {
    listAllUsers,
    createUser,
    suspendUser,
    reactivateUser,
    getUserInfos,
    testConnection,
    resetUserPassword
};
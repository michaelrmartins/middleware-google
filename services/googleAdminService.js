// services/googleAdminService.js

const { google } = require('googleapis');
const path = require('path');

// --- DEBUG LOGS ---
console.log('--- DEBUGGING FOR GOOGLE ADMIN SERVICE ---');
console.log('ADMIN_EMAIL lido do ambiente:', process.env.ADMIN_EMAIL);
console.log('DOMAIN_EMAIL lido do ambiente:', process.env.DOMAIN_EMAIL);
console.log('------------------------------------');

const ADMIN_EMAIL_TO_IMPERSONATE = process.env.ADMIN_EMAIL;
const SCOPES = ['https://www.googleapis.com/auth/admin.directory.user','https://www.googleapis.com/auth/admin.directory.user.readonly'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-credentials.json');

const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
    clientOptions: { subject: ADMIN_EMAIL_TO_IMPERSONATE },
});

const admin = google.admin({ version: 'directory_v1', auth });

/**
 * Lista todos os usuários de um domínio do Google Workspace.
 * @param {string} domain - O domínio principal da sua organização (ex: 'sua-faculdade.edu.br').
 * @returns {Promise<Array>} - Uma promessa que resolve para uma lista de usuários.
 */
async function listAllUsers(domain) {
    console.log(`Buscando todos os usuários do domínio: ${domain}`);
    
    const response = await admin.users.list({
        domain: domain,       // Especifica de qual domínio listar os usuários
        maxResults: 500,      // O máximo permitido por página é 500
        orderBy: 'email',     // Ordena os resultados pelo e-mail
        viewType: 'domain_public' // Garante que campos públicos sejam visíveis
    });

    // A API retorna os usuários dentro de `response.data.users`
    return response.data.users || []; // Retorna um array vazio se não houver usuários
}

// Função de serviço para criar usuário
async function createUser(userData) {
    const { primaryEmail, password, givenName, familyName } = userData;
    // Note que não há 'req' ou 'res' aqui!
    const response = await admin.users.insert({
        requestBody: {
            primaryEmail,
            password,
            name: { givenName, familyName },
            changePasswordAtNextLogin: true,
        },
    });
    return response.data;
}

// Função de serviço para suspender usuário
async function suspendUser(userEmail) {
    await admin.users.update({
        userKey: userEmail,
        requestBody: { suspended: true },
    });
    return { message: `Usuário ${userEmail} suspenso com sucesso.` };
}

// Função de serviço para reativar usuário
async function reactivateUser(userEmail) {
    await admin.users.update({
        userKey: userEmail,
        requestBody: { suspended: false },
    });
    return { message: `Usuário ${userEmail} reativado com sucesso.` };
}

// Exportamos as funções que o resto da aplicação usará
module.exports = {
    listAllUsers,
    createUser,
    suspendUser,
    reactivateUser,
};
// services/googleTestService.js

const { google } = require('googleapis');
const path = require('path');

// Escopo de permissão mínimo, apenas para ver informações básicas de perfil.
const SCOPES = ['https://www.googleapis.com/auth/userinfo.profile'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-credentials.json');

// Autenticação SIMPLES, sem personificação (sem 'subject')
const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
});

// Criamos uma instância do serviço People API
const people = google.people({ version: 'v1', auth });

/**
 * Pede à API 'people' para retornar os dados do perfil da própria
 * conta de serviço que está se autenticando.
 */
async function getOwnProfile() {
    console.log('--- EXECUTANDO TESTE DA PEOPLE API ---');
    console.log('Buscando o perfil da própria Conta de Serviço...');

    const response = await people.people.get({
        // 'people/me' é um atalho para "a identidade que está fazendo esta chamada"
        resourceName: 'people/me',
        // Pedimos para a API nos retornar os nomes e e-mails associados
        personFields: 'names,emailAddresses',
    });

    return response.data;
}

module.exports = { getOwnProfile };
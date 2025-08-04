// controllers/googleTestController.js

const googleTestService = require('../services/googleTestService');

async function whoamiController(req, res) {
    try {
        const profile = await googleTestService.getOwnProfile();
        console.log('--- SUCESSO NO TESTE! PERFIL OBTIDO: ---', profile);
        res.status(200).json(profile);
    } catch (error) {
        console.error('--- FALHA NO TESTE DA PEOPLE API ---:', error.message);
        res.status(500).json({ 
            message: 'O teste de autenticação básica falhou.', 
            error: error.message 
        });
    }
}

module.exports = { whoamiController };
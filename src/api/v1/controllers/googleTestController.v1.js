// controllers/googleTestController.js

const googleTestService = require('../../../../services/googleTestService');

async function whoamiController(req, res) {
    try {
        const profile = await googleTestService.getOwnProfile();
        console.log('---SUCESS ---', profile);
        res.status(200).json(profile);
    } catch (error) {
        console.error('--- PEOPLE API TEST ERROR ---:', error.message);
        res.status(500).json({ 
            message: 'Basic Authentication test failed', 
            error: error.message 
        });
    }
}

module.exports = { whoamiController };
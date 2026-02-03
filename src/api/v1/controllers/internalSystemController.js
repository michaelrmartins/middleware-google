// src/api/v1/controllers/internalSystemController.js
// Controller for internal system operations

const internalSystemModel = require('../../../models/internalSystemModel');

// Health check controller
const healthCheck = async (req, res) => {
    try {
        const result = await internalSystemModel.healthCheck();
        if (result.status === 'ok') {
            res.status(200).json({ status: 'ok', database: 'connected' });
        } else {
            res.status(500).json({ status: 'error', message: result.message });
        }
    } catch (error) {
        console.error('Health check controller error:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

module.exports = {
    healthCheck,
};
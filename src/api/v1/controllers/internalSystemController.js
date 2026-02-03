// src/api/v1/controllers/internalSystemController.js
// Controller for internal system operations

const internalSystemModel = require('../../../models/internalSystemModel');

// Health check controller
const healthCheckController = async (req, res) => {
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

// Controller to get all logs
const getAllLogsController = async (req, res) => {
    try {
        const logs = await internalSystemModel.getAllLogsModel();
        res.status(200).json({ status: 'ok', data: logs });
    } catch (error) {
        console.error('Get all logs controller error:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

module.exports = {
    healthCheckController, getAllLogsController,
};
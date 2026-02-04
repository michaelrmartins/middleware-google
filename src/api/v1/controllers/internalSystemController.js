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

// Controller to get all tenants 
const getLogsAllTenantsController = async (req, res) => {
    // const { tenantId } = req.params;
    try {
        const logs = await internalSystemModel.getLogsAllTenantsModel();
        res.status(200).json({ status: 'ok', data: logs });
    } catch (error) {
        console.error('Get logs All Tenants controller error:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Controller to get logs by tenant ID
const getLogsByTenantIdController = async (req, res) => {
    const { tenantId } = req.params;
    try {
        const logs = await internalSystemModel.getLogsByTenantIdModel(tenantId);
        res.status(200).json({ status: 'ok', data: logs });
    } catch (error) {
        console.error('Get logs by tenant ID controller error:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
}

// controller to get logs by status code
const getLogsByStatusCodeController = async (req, res) => {
    const { statusCode } = req.params;
    try {
        const logs = await internalSystemModel.getLogsByStatusCodeModel(statusCode);
        res.status(200).json({ status: 'ok', data: logs });
    } catch (error) {
        console.error('Get logs by status code controller error:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};      

// controller to get logs by endpoint   
const getLogsByEndpointController = async (req, res) => {
    const { endpoint } = req.params;
    try {
        const logs = await internalSystemModel.getLogsByEndpointModel(endpoint);
        res.status(200).json({ status: 'ok', data: logs });
    } catch (error) {
        console.error('Get logs by endpoint controller error:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Controller to get logs by Http Method
const getLogsByHttpMethodController = async (req, res) => {
    const { httpMethod } = req.params;
    try {
        const logs = await internalSystemModel.getLogsByHttpMethodModel(httpMethod);
        res.status(200).json({ status: 'ok', data: logs });
    } catch (error) {
        console.error('Get logs by HTTP method controller error:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Controller to get logs by Date Range
const getLogsByDateRangeController = async (req, res) => {
    const { startDate, endDate } = req.body;

    // Convert ddmmyyyy to yyyy-mm-dd format
    const parseDate = (dateStr) => {
    const dia = dateStr.substring(0, 2);
    const mes = dateStr.substring(2, 4);
    const ano = dateStr.substring(4, 8);
    return new Date(ano, mes - 1, dia);
    };

    const start = parseDate(startDate); 
    const end = parseDate(endDate); 
    end.setHours(23, 59, 59, 999);

    try {
        const logs = await internalSystemModel.getLogsByDateRangeModel(start, end);
        res.status(200).json({ status: 'ok', data: logs });
    } catch (error) {
        console.error('Get logs by date range controller error:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

module.exports = {
    healthCheckController, 
    getAllLogsController, 
    getLogsAllTenantsController,
    getLogsByTenantIdController,
    getLogsByStatusCodeController, 
    getLogsByEndpointController,
    getLogsByHttpMethodController, 
    getLogsByDateRangeController
};
// src/models/LogModel.js
const db = require('../config/database'); 
const query = require ('./query/query')

// Health check function to verify database connectivity
const healthCheck = async () => {
    try {
        const query = 'SELECT 1;';
        await db.query(query);
        return { status: 'ok' };
    } catch (error) {
        console.error('Database health check error:', error.message);
        return { status: 'error', message: error.message };
    }
};

// Function to retrieve all logs from the database
 const getAllLogsModel = async (limit = 100) => {
    try {
        // const values = [limit];
        const result = await db.query(query.getAlllogsQuery);
        return result.rows;
    } catch (error) {
        console.error('Error fetching logs:', error.message);
        throw error;
    }
};

// Get all logs by tenant ID
const getLogsByTenantIdModel = async (tenantId) => {
    try {
        const values = [tenantId];
        console.log('Tenant ID received in model:', values);
        const result = await db.query(query.getLogsByTenantIdQuery, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching logs by tenant ID:', error.message);
        throw error;
    }       
};

// Get all logs by HTTP Status Code
const getLogsByStatusCodeModel = async (statusCode) => {
    try {
        const values = [statusCode];
        const result = await db.query(query.getLogsByStatusCodeQuery, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching logs by status code:', error.message);
        throw error;
    }
};

// Get all logs by Endpoint
const getLogsByEndpointModel = async (endpoint) => {
    try {
        const values = [endpoint];
        const result = await db.query(query.getLogsByEndpointQuery, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching logs by endpoint:', error.message);
        throw error;
    }
};

// Get all logs by HTTP Method
const getLogsByHttpMethodModel = async (httpMethod) => {
    try {
        const values = [httpMethod];
        const result = await db.query(query.getLogsByHttpMethodQuery, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching logs by HTTP method:', error.message);
        throw error;
    }
};

// Get all logs by Date Range
const getLogsByDateRangeModel = async (startDate, endDate) => {
    try {
        const values = [startDate, endDate];
        const result = await db.query(query.getLogsByDateRangeQuery, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching logs by date range:', error.message);
        throw error;
    }
};

// Export 
module.exports = { healthCheck, 
                   getAllLogsModel, 
                   getLogsByTenantIdModel,
                   getLogsByStatusCodeModel, 
                   getLogsByEndpointModel, 
                   getLogsByHttpMethodModel, 
                   getLogsByDateRangeModel 
};
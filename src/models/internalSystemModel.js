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

// Function to retrieve logs from the database
 const getAllLogsModel = async (limit = 100) => {
    try {
        // const values = [limit];
        const result = await db.query(query.getAlllogsQuery);
        return result.rows;
    } catch (error) {
        console.error('Error fetching logs:', error.message);
        throw error;
    }
}

module.exports = { healthCheck, getAllLogsModel};
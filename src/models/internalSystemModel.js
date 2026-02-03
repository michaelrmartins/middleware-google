// src/models/LogModel.js
const db = require('../config/database'); 

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

module.exports = { healthCheck};
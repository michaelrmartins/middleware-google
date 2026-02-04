const express = require('express');
const router = express.Router();

const internalSystemController = require('../controllers/internalSystemController');

// Health check route
router.get('/health', internalSystemController.healthCheckController);

// Get logs routes
router.get('/logs', internalSystemController.getAllLogsController);
router.get('/logs/tenant/:tenantId', internalSystemController.getLogsByTenantIdController);
router.get('/logs/status/:statusCode', internalSystemController.getLogsByStatusCodeController);
router.get('/logs/endpoint/:endpoint', internalSystemController.getLogsByEndpointController);
router.get('/logs/method/:httpMethod', internalSystemController.getLogsByHttpMethodController);
router.post('/logs/daterange', internalSystemController.getLogsByDateRangeController);

// Module exports
module.exports = router;
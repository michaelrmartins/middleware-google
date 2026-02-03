const express = require('express');
const router = express.Router();

const internalSystemController = require('../controllers/internalSystemController');

// Health check route
router.get('/health', internalSystemController.healthCheckController);

// Get all logs route
router.get('/logs', internalSystemController.getAllLogsController);
module.exports = router;
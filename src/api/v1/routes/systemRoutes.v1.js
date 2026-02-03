const express = require('express');
const router = express.Router();

const internalSystemController = require('../controllers/internalSystemController');

// Health check route
router.get('/health', internalSystemController.healthCheck);

module.exports = router;
// routes/googleTestRoutes.js

const express = require('express');
const router = express.Router();
const testController = require('../controllers/googleTestController');

router.get('/whoami', testController.whoamiController);

module.exports = router;
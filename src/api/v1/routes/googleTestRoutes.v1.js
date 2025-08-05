// routes/googleTestRoutes.js

const express = require('express');
const router = express.Router();
const testController = require('../controllers/googleTestController.v1');

router.get('/whoami', testController.whoamiController);

module.exports = router;
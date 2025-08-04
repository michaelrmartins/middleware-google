// Routes for the application - index.js

const express = require('express')
const router = express.Router();
const path = require('path');   

// Importing the routes from the 'routes' directory
const userRoutes = require('./userRoutes');
const testRoutes = require('./googleTestRoutes'); // <-- 1. Importe a rota de teste

router.use('/users', userRoutes);

router.use('/test', testRoutes); // <-- 2. Use a rota de teste

module.exports = router;
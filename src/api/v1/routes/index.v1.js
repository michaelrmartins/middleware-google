// Routes for the application - index.js

const express = require('express')
const router = express.Router();
const path = require('path');   

// Importing the routes from the 'routes' directory
const userRoutes = require('./userRoutes.v1');
const testRoutes = require('./googleTestRoutes.v1'); 

router.get('/', (req, res) => {res.status(200).send('Google API - Home');});
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/test', testRoutes); 

module.exports = router;
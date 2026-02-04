// Core APP File

const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./src/api/v1/routes/index.v1');
const path = require('path');

// Enable JSON parsing
app.use(express.json());

app.use(cors(
    {
        origin: 'http://relatorios.api-google.intranet', credentials: true
    }
));

console.log("Middleware Google App is starting...");

// route for test 
// app.get('/', (req, res) => {
//     res.status(200).send('Welcome to the Middleware Google App!!!');
// });

app.use(routes);

module.exports = app;
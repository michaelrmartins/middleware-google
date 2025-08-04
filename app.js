// Core APP File

const express = require('express');
const app = express();
const routes = require('./routes');
const path = require('path');

// Enable JSON parsing
app.use(express.json());

console.log("Middleware Google App is starting...");

// route for test 
// app.get('/', (req, res) => {
//     res.status(200).send('Welcome to the Middleware Google App!!!');
// });

app.use(routes);

module.exports = app;
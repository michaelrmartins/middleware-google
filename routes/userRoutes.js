const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', (req, res) => {res.status(200).send('User route is working!');});

router.get('/email-list', adminController.listAllUsersController)
router.get('/email-create', (req, res) => {res.status(200).send('Email creation route is working!');})
router.get('/email-disable', (req, res) => {res.status(200).send('Email disable route is working!');})
router.get('/email-enable', (req, res) => {res.status(200).send('Email enable route is working!');})
router.get('/email-password-reset', (req, res) => {res.status(200).send('Email reset password route is working!');})

module.exports = router;
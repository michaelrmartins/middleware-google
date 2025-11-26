const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.v1');

router.get('/', (req, res) => {res.status(200).send('User route is working!');});

router.post('/email-list', adminController.listAllUsersController)
router.post('/email-create', adminController.createNewUserController)
router.post('/email-disable', adminController.suspendUserController)
router.post('/email-enable', adminController.reactivateUserController)
router.post('/email-infos', adminController.getUserInfosController)
router.post('/email-password-reset', adminController.resetUserPasswordController)

module.exports = router;
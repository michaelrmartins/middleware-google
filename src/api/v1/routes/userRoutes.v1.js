const express = require('express');
const router = express.Router();
const auditLogger = require('../../../middleware/auditLogger');
const adminController = require('../controllers/adminController.v1');

router.get('/', (req, res) => {res.status(200).send('User route is working!');});

router.post('/email-list',auditLogger,adminController.listAllUsersController)
router.post('/email-create', auditLogger,adminController.createNewUserController)
router.post('/email-disable', auditLogger,adminController.suspendUserController)
router.post('/email-enable', auditLogger,adminController.reactivateUserController)
router.post('/email-infos', auditLogger,adminController.getUserInfosController)
router.post('/email-password-reset', auditLogger,adminController.resetUserPasswordController)
router.post('/drive-infos', auditLogger,adminController.getDriveUserInfosController)

module.exports = router;
const express = require('express');
const router = express.Router();

const adminAuthController = require('../../controllers/admin/adminAuthController');
const adminAuth = require('../../middleware/admin/adminAuth');
const { authLimiter } = require('../../middleware/global/rateLimit');

router.post('/login', authLimiter, adminAuthController.login);
router.post('/refresh', adminAuthController.refresh);
router.post('/logout', adminAuth, adminAuthController.logout);
router.get('/me', adminAuth, adminAuthController.me);
router.post('/change-password', adminAuth, adminAuthController.changePassword);

module.exports = router;
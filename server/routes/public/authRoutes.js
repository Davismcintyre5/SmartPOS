const express = require('express');
const router = express.Router();

const authController = require('../../controllers/public/authController');
const { authLimiter } = require('../../middleware/global/rateLimit');
const clientAuth = require('../../middleware/client/auth');

router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

router.get('/me', clientAuth, authController.me);
router.post('/change-password', clientAuth, authController.changePassword);

module.exports = router;
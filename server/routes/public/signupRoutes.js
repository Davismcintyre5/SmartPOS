const express = require('express');
const router = express.Router();

const signupController = require('../../controllers/public/signupController');
const { authLimiter } = require('../../middleware/global/rateLimit');

router.post('/trial', authLimiter, signupController.startTrial);
router.post('/register', authLimiter, signupController.registerPaid);
router.get('/registration/:id', signupController.getRegistration);
router.post('/checkout', authLimiter, signupController.checkout);
router.post('/mpesa/submit-code', authLimiter, signupController.submitMpesaCode);

module.exports = router;
const express = require('express');
const router = express.Router();

const aiController = require('../../controllers/public/aiController');
const rateLimit = require('express-rate-limit');

const landingAiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait a moment.' }
});

router.post('/landing', landingAiLimiter, aiController.chat);

module.exports = router;
const express = require('express');
const router = express.Router();

const siteSettingsRoutes = require('./siteSettingsRoutes');
const legalRoutes = require('./legalRoutes');
const authRoutes = require('./authRoutes');
const signupRoutes = require('./signupRoutes');
const webhookRoutes = require('./webhookRoutes');
const healthRoutes = require('./healthRoutes');

router.use('/site', siteSettingsRoutes);
router.use('/legal', legalRoutes);
router.use('/auth', authRoutes);
router.use('/signup', signupRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/health', healthRoutes);

module.exports = router;
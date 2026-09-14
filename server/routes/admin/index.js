const express = require('express');
const router = express.Router();

const adminAuthRoutes = require('./adminAuthRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const clientsRoutes = require('./clientsRoutes');
const subscriptionsRoutes = require('./subscriptionsRoutes');
const paymentsRoutes = require('./paymentsRoutes');
const plansRoutes = require('./plansRoutes');
const paymentMethodsRoutes = require('./paymentMethodsRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const revenueRoutes = require('./revenueRoutes');
const notificationsRoutes = require('./notificationsRoutes');
const adminUsersRoutes = require('./adminUsersRoutes');
const adminSettingsRoutes = require('./adminSettingsRoutes');
const auditRoutes = require('./auditRoutes');
const backupRoutes = require('./backupRoutes');
const legalRoutes = require('./legalRoutes');
const systemHealthRoutes = require('./systemHealthRoutes');

router.use('/auth', adminAuthRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/clients', clientsRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/plans', plansRoutes);
router.use('/payment-methods', paymentMethodsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/revenue', revenueRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admins', adminUsersRoutes);
router.use('/settings', adminSettingsRoutes);
router.use('/audit', auditRoutes);
router.use('/backups', backupRoutes);
router.use('/legal', legalRoutes);
router.use('/system-health', systemHealthRoutes);

module.exports = router;
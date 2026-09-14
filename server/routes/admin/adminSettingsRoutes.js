const express = require('express');
const router = express.Router();

const adminSettingsController = require('../../controllers/admin/adminSettingsController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

router.get('/', adminSettingsController.get);
router.get('/public', adminSettingsController.getPublic);
router.put('/', requireRole(['super_admin']), auditLog('settings.update'), adminSettingsController.update);
router.post('/cache/invalidate', requireRole(['super_admin']), adminSettingsController.invalidateCache);

router.get('/currencies', adminSettingsController.getCurrencies);
router.put('/currencies', requireRole(['super_admin']), auditLog('settings.currencies'), adminSettingsController.updateCurrencies);

router.get('/feature-flags', adminSettingsController.getFeatureFlags);
router.put('/feature-flags', requireRole(['super_admin']), auditLog('settings.featureFlags'), adminSettingsController.updateFeatureFlags);

router.get('/security', adminSettingsController.getSecurity);
router.put('/security', requireRole(['super_admin']), auditLog('settings.security'), adminSettingsController.updateSecurity);

router.get('/sync', adminSettingsController.getSync);
router.put('/sync', requireRole(['super_admin']), auditLog('settings.sync'), adminSettingsController.updateSync);

router.get('/onboarding', adminSettingsController.getOnboarding);
router.put('/onboarding', requireRole(['super_admin']), auditLog('settings.onboarding'), adminSettingsController.updateOnboarding);

router.get('/branding', adminSettingsController.getBranding);
router.put('/branding', requireRole(['super_admin']), auditLog('settings.branding'), adminSettingsController.updateBranding);

router.get('/tax', adminSettingsController.getTax);
router.put('/tax', requireRole(['super_admin']), auditLog('settings.tax'), adminSettingsController.updateTax);

router.get('/email', adminSettingsController.getEmail);
router.put('/email', requireRole(['super_admin']), auditLog('settings.email'), adminSettingsController.updateEmail);

router.get('/sms', adminSettingsController.getSms);
router.put('/sms', requireRole(['super_admin']), auditLog('settings.sms'), adminSettingsController.updateSms);

module.exports = router;
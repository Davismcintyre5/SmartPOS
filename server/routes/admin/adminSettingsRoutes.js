const express = require('express');
const router = express.Router();

const adminSettingsController = require('../../controllers/admin/adminSettingsController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

// ── Core settings ───────────────────────────────────────
router.get('/', adminSettingsController.get);
router.get('/public', adminSettingsController.getPublic);
router.put('/', requireRole(['super_admin']), auditLog('settings.update'), adminSettingsController.update);
router.post('/cache/invalidate', requireRole(['super_admin']), adminSettingsController.invalidateCache);

// ── Currencies ──────────────────────────────────────────
router.get('/currencies', adminSettingsController.getCurrencies);
router.put('/currencies', requireRole(['super_admin']), auditLog('settings.currencies'), adminSettingsController.updateCurrencies);

// ── Feature flags ───────────────────────────────────────
router.get('/feature-flags', adminSettingsController.getFeatureFlags);
router.put('/feature-flags', requireRole(['super_admin']), auditLog('settings.featureFlags'), adminSettingsController.updateFeatureFlags);

// ── Security ────────────────────────────────────────────
router.get('/security', adminSettingsController.getSecurity);
router.put('/security', requireRole(['super_admin']), auditLog('settings.security'), adminSettingsController.updateSecurity);

// ── Sync ────────────────────────────────────────────────
router.get('/sync', adminSettingsController.getSync);
router.put('/sync', requireRole(['super_admin']), auditLog('settings.sync'), adminSettingsController.updateSync);

// ── Onboarding ──────────────────────────────────────────
router.get('/onboarding', adminSettingsController.getOnboarding);
router.put('/onboarding', requireRole(['super_admin']), auditLog('settings.onboarding'), adminSettingsController.updateOnboarding);

// ── Branding ────────────────────────────────────────────
router.get('/branding', adminSettingsController.getBranding);
router.put('/branding', requireRole(['super_admin']), auditLog('settings.branding'), adminSettingsController.updateBranding);

// ── Tax ─────────────────────────────────────────────────
router.get('/tax', adminSettingsController.getTax);
router.put('/tax', requireRole(['super_admin']), auditLog('settings.tax'), adminSettingsController.updateTax);

// ── Email ───────────────────────────────────────────────
router.get('/email', adminSettingsController.getEmail);
router.put('/email', requireRole(['super_admin']), auditLog('settings.email'), adminSettingsController.updateEmail);

// ── SMS ─────────────────────────────────────────────────
router.get('/sms', adminSettingsController.getSms);
router.put('/sms', requireRole(['super_admin']), auditLog('settings.sms'), adminSettingsController.updateSms);

// ── Backups ─────────────────────────────────────────────
router.get('/backups', adminSettingsController.getBackups);
router.put('/backups', requireRole(['super_admin']), auditLog('settings.backups'), adminSettingsController.updateBackups);

// ── Downloads ───────────────────────────────────────────
// Note: /downloads/reorder MUST come before /downloads/:id
router.get('/downloads', adminSettingsController.getDownloads);
router.post('/downloads/reorder',
  requireRole(['super_admin', 'admin']),
  auditLog('settings.download.reorder'),
  adminSettingsController.reorderDownloads
);
router.post('/downloads',
  requireRole(['super_admin', 'admin']),
  auditLog('settings.download.add'),
  adminSettingsController.addDownload
);
router.put('/downloads/:id',
  requireRole(['super_admin', 'admin']),
  auditLog('settings.download.update'),
  adminSettingsController.updateDownload
);
router.post('/downloads/:id/toggle',
  requireRole(['super_admin', 'admin']),
  auditLog('settings.download.toggle'),
  adminSettingsController.toggleDownload
);
router.delete('/downloads/:id',
  requireRole(['super_admin']),
  auditLog('settings.download.delete'),
  adminSettingsController.removeDownload
);

module.exports = router;
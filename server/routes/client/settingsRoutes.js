const express = require('express');
const multer = require('multer');
const router = express.Router();

const settingsController = require('../../controllers/client/settingsController');
const externalKeyController = require('../../controllers/client/externalKeyController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');
const requireRole = require('../../middleware/client/role');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

router.use(auth, period);

// ── General settings ────────────────────────────────────
router.get('/', settingsController.get);
router.put('/', requireRole(['owner', 'manager']), settingsController.update);
router.put('/receipt', requireRole(['owner', 'manager']), settingsController.updateReceipt);
router.put('/tax', requireRole(['owner', 'manager']), settingsController.updateTax);
router.put('/currency', requireRole(['owner']), settingsController.updateCurrency);
router.put('/loyalty', requireRole(['owner', 'manager']), settingsController.updateLoyalty);
router.put('/sync', requireRole(['owner', 'manager']), settingsController.updateSync);
router.post('/logo', requireRole(['owner']), upload.single('file'), settingsController.uploadLogo);

// ── AI settings ─────────────────────────────────────────
router.put('/ai', requireRole(['owner', 'manager']), settingsController.updateAi);

// ── External API key (under AI) ─────────────────────────
router.get('/ai/key', requireRole(['owner']), externalKeyController.getKey);
router.post('/ai/key', requireRole(['owner']), externalKeyController.createKey);
router.delete('/ai/key', requireRole(['owner']), externalKeyController.revokeKey);

module.exports = router;
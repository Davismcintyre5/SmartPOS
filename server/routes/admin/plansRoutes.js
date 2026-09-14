const express = require('express');
const router = express.Router();

const plansController = require('../../controllers/admin/plansController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

router.get('/', plansController.list);
router.get('/:id', plansController.getOne);
router.put('/:id', requireRole(['super_admin']), auditLog('plan.update'), plansController.update);
router.post('/:id/toggle', requireRole(['super_admin']), auditLog('plan.toggle'), plansController.toggle);
router.post('/:id/sync-stripe', requireRole(['super_admin']), auditLog('plan.syncStripe'), plansController.syncStripePrices);

module.exports = router;
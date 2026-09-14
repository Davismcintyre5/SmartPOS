const express = require('express');
const router = express.Router();

const paymentsController = require('../../controllers/admin/paymentsController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

router.get('/', paymentsController.list);
router.get('/:id', paymentsController.getOne);
router.post('/:id/verify', requireRole(['super_admin', 'admin']), auditLog('payment.verify'), paymentsController.verifyManual);
router.post('/:id/retry', requireRole(['super_admin', 'admin']), auditLog('payment.retry'), paymentsController.retry);
router.post('/:id/refund', requireRole(['super_admin']), auditLog('payment.refund'), paymentsController.refund);

module.exports = router;
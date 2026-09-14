const express = require('express');
const router = express.Router();

const subscriptionsController = require('../../controllers/admin/subscriptionsController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

router.get('/', subscriptionsController.list);
router.get('/renewals', subscriptionsController.renewals);
router.get('/:id', subscriptionsController.getOne);
router.get('/:id/history', subscriptionsController.history);
router.post('/:id/extend', requireRole(['super_admin', 'admin']), auditLog('subscription.extend'), subscriptionsController.extendPeriod);
router.post('/:id/renew', requireRole(['super_admin', 'admin']), auditLog('subscription.renew'), subscriptionsController.forceRenew);
router.post('/:id/suspend', requireRole(['super_admin', 'admin']), auditLog('subscription.suspend'), subscriptionsController.forceSuspend);
router.post('/:id/expire', requireRole(['super_admin', 'admin']), auditLog('subscription.expire'), subscriptionsController.forceExpire);

module.exports = router;
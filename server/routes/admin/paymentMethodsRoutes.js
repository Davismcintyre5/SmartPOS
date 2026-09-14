const express = require('express');
const router = express.Router();

const paymentMethodsController = require('../../controllers/admin/paymentMethodsController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

router.get('/', paymentMethodsController.list);
router.get('/:id', paymentMethodsController.getOne);
router.put('/:id', requireRole(['super_admin']), auditLog('paymentMethod.update'), paymentMethodsController.update);
router.post('/:id/toggle', requireRole(['super_admin']), auditLog('paymentMethod.toggle'), paymentMethodsController.toggle);
router.post('/:id/test', requireRole(['super_admin', 'admin']), paymentMethodsController.test);

module.exports = router;
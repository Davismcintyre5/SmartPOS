const express = require('express');
const router = express.Router();

const legalController = require('../../controllers/admin/legalController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

router.get('/', legalController.list);
router.post('/', requireRole(['super_admin']), auditLog('legal.create'), legalController.create);
router.get('/:id', legalController.getOne);
router.put('/:id', requireRole(['super_admin']), auditLog('legal.update'), legalController.update);
router.post('/:id/activate', requireRole(['super_admin']), auditLog('legal.activate'), legalController.activate);
router.post('/:id/deactivate', requireRole(['super_admin']), auditLog('legal.deactivate'), legalController.deactivate);
router.get('/type/:type/history', legalController.history);
router.get('/type/:type/acceptances', legalController.acceptances);

module.exports = router;
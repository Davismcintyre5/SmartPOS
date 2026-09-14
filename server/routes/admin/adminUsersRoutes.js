const express = require('express');
const router = express.Router();

const adminUsersController = require('../../controllers/admin/adminUsersController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

router.get('/', requireRole(['super_admin', 'admin']), adminUsersController.list);
router.post('/invite', requireRole(['super_admin']), auditLog('admin.invite'), adminUsersController.invite);
router.get('/:id', requireRole(['super_admin', 'admin']), adminUsersController.getOne);
router.put('/:id', requireRole(['super_admin']), auditLog('admin.update'), adminUsersController.update);
router.post('/:id/role', requireRole(['super_admin']), auditLog('admin.assignRole'), adminUsersController.assignRole);
router.post('/:id/deactivate', requireRole(['super_admin']), auditLog('admin.deactivate'), adminUsersController.deactivate);
router.post('/:id/activate', requireRole(['super_admin']), auditLog('admin.activate'), adminUsersController.activate);
router.post('/:id/reset-password', requireRole(['super_admin']), auditLog('admin.resetPassword'), adminUsersController.resetPassword);

module.exports = router;
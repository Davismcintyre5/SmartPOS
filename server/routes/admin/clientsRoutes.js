const express = require('express');
const router = express.Router();

const clientsController = require('../../controllers/admin/clientsController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

router.get('/', clientsController.list);
router.get('/pending', clientsController.pendingApprovals);
router.post('/', requireRole(['super_admin', 'admin']), auditLog('client.create'), clientsController.create);

router.get('/:id', clientsController.getOne);
router.post('/:id/approve', requireRole(['super_admin', 'admin']), auditLog('client.approve'), clientsController.approve);
router.post('/:id/reject', requireRole(['super_admin', 'admin']), auditLog('client.reject'), clientsController.reject);
router.post('/:id/suspend', requireRole(['super_admin', 'admin']), auditLog('client.suspend'), clientsController.suspend);
router.post('/:id/restore', requireRole(['super_admin', 'admin']), auditLog('client.restore'), clientsController.restore);
router.post('/:id/extend-trial', requireRole(['super_admin', 'admin']), auditLog('client.extendTrial'), clientsController.extendTrial);
router.post('/:id/issue-ent', requireRole(['super_admin']), auditLog('client.issueEnt'), clientsController.issueEnt);
router.post('/:id/revoke-ent', requireRole(['super_admin']), auditLog('client.revokeEnt'), clientsController.revokeEnt);
router.post('/:id/impersonate', requireRole(['super_admin', 'admin']), auditLog('client.impersonate'), clientsController.impersonate);
router.delete('/:id', requireRole(['super_admin']), auditLog('client.delete'), clientsController.remove);

module.exports = router;
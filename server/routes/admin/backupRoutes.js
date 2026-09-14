const express = require('express');
const multer = require('multer');
const router = express.Router();

const backupController = require('../../controllers/admin/backupController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(adminAuth);

router.get('/', backupController.list);
router.get('/stats', backupController.stats);

router.get('/settings', backupController.getSettings);
router.put('/settings', requireRole(['super_admin']), auditLog('backup.settings'), backupController.updateSettings);

router.post('/', requireRole(['super_admin']), auditLog('backup.create'), backupController.create);
router.post('/upload', requireRole(['super_admin']), auditLog('backup.upload'), upload.single('file'), backupController.upload);
router.post('/cleanup', requireRole(['super_admin']), auditLog('backup.cleanup'), backupController.cleanup);

router.get('/:id', backupController.getOne);
router.get('/:id/download', backupController.download);
router.post('/:id/email', requireRole(['super_admin', 'admin']), auditLog('backup.email'), backupController.sendToEmail);
router.post('/:id/restore', requireRole(['super_admin']), auditLog('backup.restore'), backupController.restore);
router.delete('/:id', requireRole(['super_admin']), auditLog('backup.delete'), backupController.remove);

module.exports = router;
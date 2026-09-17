const express = require('express');
const router = express.Router();

const aiController = require('../../controllers/admin/aiController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');
const auditLog = require('../../middleware/admin/auditLog');

router.use(adminAuth);

router.get('/', aiController.get);
router.put('/', requireRole(['super_admin']), auditLog('ai.update'), aiController.update);
router.post('/providers/:key/test', requireRole(['super_admin']), aiController.testProvider);

module.exports = router;
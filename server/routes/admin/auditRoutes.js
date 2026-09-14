const express = require('express');
const router = express.Router();

const auditController = require('../../controllers/admin/auditController');
const adminAuth = require('../../middleware/admin/adminAuth');
const requireRole = require('../../middleware/admin/requireRole');

router.use(adminAuth);

router.get('/', requireRole(['super_admin', 'admin']), auditController.list);
router.get('/target/:targetId', requireRole(['super_admin', 'admin']), auditController.getForTarget);

module.exports = router;
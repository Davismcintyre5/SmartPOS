const express = require('express');
const router = express.Router();

const notificationsController = require('../../controllers/admin/notificationsController');
const adminAuth = require('../../middleware/admin/adminAuth');

router.use(adminAuth);

router.get('/', notificationsController.list);
router.get('/unread-count', notificationsController.unreadCount);
router.post('/:id/read', notificationsController.markRead);
router.post('/read-all', notificationsController.markAllRead);

module.exports = router;
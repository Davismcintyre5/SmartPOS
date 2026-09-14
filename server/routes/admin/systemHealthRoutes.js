const express = require('express');
const router = express.Router();

const systemHealthController = require('../../controllers/admin/systemHealthController');
const adminAuth = require('../../middleware/admin/adminAuth');

router.use(adminAuth);

router.get('/', systemHealthController.health);

module.exports = router;
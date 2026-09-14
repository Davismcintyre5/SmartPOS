const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/admin/dashboardController');
const adminAuth = require('../../middleware/admin/adminAuth');

router.get('/overview', adminAuth, dashboardController.overview);

module.exports = router;
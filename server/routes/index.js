const express = require('express');

const publicRoutes = require('./public');
const clientRoutes = require('./client');
const adminRoutes = require('./admin');

const router = express.Router();

router.use('/', publicRoutes);
router.use('/', clientRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
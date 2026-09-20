const express = require('express');

const publicRoutes = require('./public');
const clientRoutes = require('./client');
const externalRoutes = require('./external');
const adminRoutes = require('./admin');

const router = express.Router();

router.use('/', publicRoutes);
router.use('/', clientRoutes);
router.use('/external', externalRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
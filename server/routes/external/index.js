const express = require('express');
const router = express.Router();

const externalKeyAuth = require('../../middleware/client/externalKeyAuth');
const { externalLimiter } = require('../../middleware/global/rateLimit');
const externalKeyController = require('../../controllers/client/externalKeyController');

router.get('/data', externalLimiter, externalKeyAuth, externalKeyController.fetchAll);

module.exports = router;
const express = require('express');
const router = express.Router();

const siteController = require('../../controllers/public/siteController');

router.get('/', siteController.getLegal);
router.get('/:type', siteController.getLegalByType);
router.get('/:type/versions', siteController.getLegalVersions);

module.exports = router;
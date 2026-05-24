const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../../controllers/admin/systemController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validate = require("../../middleware/common/validate");
const { updateSystemSchema } = require("../../validators/admin/systemValidator");

router.get("/", adminAuth, getSettings);
router.put("/", adminAuth, validate(updateSystemSchema), updateSettings);

module.exports = router;
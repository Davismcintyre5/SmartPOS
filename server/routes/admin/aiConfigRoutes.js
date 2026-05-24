const express = require("express");
const router = express.Router();
const { getConfig, updateConfig } = require("../../controllers/admin/aiConfigController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validate = require("../../middleware/common/validate");
const { updateAIConfigSchema } = require("../../validators/admin/aiConfigValidator");

router.get("/", adminAuth, getConfig);
router.put("/", adminAuth, validate(updateAIConfigSchema), updateConfig);

module.exports = router;
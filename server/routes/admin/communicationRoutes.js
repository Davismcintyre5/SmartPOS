const express = require("express");
const router = express.Router();
const { getTemplates, updateTemplates } = require("../../controllers/admin/communicationController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validate = require("../../middleware/common/validate");
const { updateCommunicationSchema } = require("../../validators/admin/communicationValidator");

router.get("/", adminAuth, getTemplates);
router.put("/", adminAuth, validate(updateCommunicationSchema), updateTemplates);

module.exports = router;
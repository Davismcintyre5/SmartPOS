const express = require("express");
const router = express.Router();
const { getAllContent, updateContent, deleteContent } = require("../../controllers/admin/contentController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validate = require("../../middleware/common/validate");
const { updateContentSchema } = require("../../validators/admin/contentValidator");

router.get("/", adminAuth, getAllContent);
router.put("/:section", adminAuth, validate(updateContentSchema), updateContent);
router.delete("/:section", adminAuth, deleteContent);

module.exports = router;
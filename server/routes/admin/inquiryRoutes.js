const express = require("express");
const router = express.Router();
const { getInquiries, resolveInquiry, deleteInquiry } = require("../../controllers/admin/inquiryController");
const adminAuth = require("../../middleware/admin/adminAuth");

router.get("/", adminAuth, getInquiries);
router.put("/:id/resolve", adminAuth, resolveInquiry);
router.delete("/:id", adminAuth, deleteInquiry);

module.exports = router;
const express = require("express");
const router = express.Router();
const { getLandingContent, getSectionContent } = require("../../controllers/public/landingController");
const { submitInquiry } = require("../../controllers/public/inquiryController");

router.get("/content", getLandingContent);
router.get("/content/:section", getSectionContent);
router.post("/inquiry", submitInquiry);

module.exports = router;
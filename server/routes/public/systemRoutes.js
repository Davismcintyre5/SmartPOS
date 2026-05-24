const express = require("express");
const router = express.Router();
const { getDownloads, getAIStatus, getPlans, getPaymentMethods } = require("../../controllers/public/landingController");

router.get("/downloads", getDownloads);
router.get("/ai-status", getAIStatus);
router.get("/plans", getPlans);
router.get("/payment-methods", getPaymentMethods);

module.exports = router;
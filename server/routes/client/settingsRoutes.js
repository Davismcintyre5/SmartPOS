// routes/client/settingsRoutes.js
const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getBusinessSettings,
  updateBusinessSettings,
  getReceiptSettings,
  updateReceiptSettings,
} = require("../../controllers/client/settingsController");

router.put("/profile", updateProfile);
router.get("/business", getBusinessSettings);
router.put("/business", updateBusinessSettings);
router.get("/receipt", getReceiptSettings);
router.put("/receipt", updateReceiptSettings);

module.exports = router;
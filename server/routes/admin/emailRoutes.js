// routes/admin/emailRoutes.js
const express = require("express");
const router = express.Router();
const { 
  getRecipients, 
  sendCustomEmail, 
  sendTestEmail 
} = require("../../controllers/admin/emailController");
const adminAuth = require("../../middleware/admin/adminAuth");

// All routes require admin authentication
router.use(adminAuth);

router.get("/recipients", getRecipients);
router.post("/send", sendCustomEmail);
router.post("/test", sendTestEmail);

module.exports = router;
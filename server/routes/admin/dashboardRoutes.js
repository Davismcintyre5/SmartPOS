const express = require("express");
const router = express.Router();
const { getDashboard } = require("../../controllers/admin/dashboardController");
const adminAuth = require("../../middleware/admin/adminAuth");

router.get("/", adminAuth, getDashboard);

module.exports = router;
const express = require("express");
const router = express.Router();
const { getDashboard } = require("../../controllers/client/dashboardController");

router.get("/", getDashboard);

module.exports = router;
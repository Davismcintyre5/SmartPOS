const express = require("express");
const router = express.Router();
const { getSalesReport, getInventoryReport } = require("../../controllers/client/reportController");

router.get("/sales", getSalesReport);
router.get("/inventory", getInventoryReport);

module.exports = router;
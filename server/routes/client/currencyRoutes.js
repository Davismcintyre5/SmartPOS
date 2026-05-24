const express = require("express");
const router = express.Router();
const { getCurrency, updateCurrency } = require("../../controllers/client/currencyController");

router.get("/", getCurrency);
router.put("/", updateCurrency);

module.exports = router;
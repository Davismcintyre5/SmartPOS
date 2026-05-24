const express = require("express");
const router = express.Router();
const { getCurrency, updateCurrency } = require("../../controllers/admin/currencyController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validate = require("../../middleware/common/validate");
const { updateCurrencySchema } = require("../../validators/admin/currencyValidator");

router.get("/", adminAuth, getCurrency);
router.put("/", adminAuth, validate(updateCurrencySchema), updateCurrency);

module.exports = router;
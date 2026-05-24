// routes/client/saleRoutes.js
const express = require("express");
const router = express.Router();
const { getSales, getSale, refundSale, deleteSale } = require("../../controllers/client/saleController");
const validate = require("../../middleware/common/validate");
const { refundSaleSchema } = require("../../validators/client/saleValidator");

router.get("/", getSales);
router.get("/:id", getSale);
router.post("/:id/refund", validate(refundSaleSchema), refundSale);
router.delete("/:id", deleteSale);

module.exports = router;
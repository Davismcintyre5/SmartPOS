// routes/client/posRoutes.js
const express = require("express");
const router = express.Router();
const {
  lookupBarcode, processSale, holdSale,
  resumeSale, getHeldSales, deleteHeldSale,
} = require("../../controllers/client/posController");
const validate = require("../../middleware/common/validate");
const { processSaleSchema, holdSaleSchema, resumeSaleSchema } = require("../../validators/client/saleValidator");

router.get("/lookup/:barcode", lookupBarcode);
router.post("/sale", validate(processSaleSchema), processSale);
router.post("/hold", validate(holdSaleSchema), holdSale);
router.put("/resume/:saleId", validate(resumeSaleSchema), resumeSale);
router.get("/held", getHeldSales);
router.delete("/held/:id", deleteHeldSale);

module.exports = router;
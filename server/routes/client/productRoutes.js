const express = require("express");
const router = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct,
} = require("../../controllers/client/productController");
const validate = require("../../middleware/common/validate");
const { createProductSchema, updateProductSchema } = require("../../validators/client/productValidator");

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", validate(createProductSchema), createProduct);
router.put("/:id", validate(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
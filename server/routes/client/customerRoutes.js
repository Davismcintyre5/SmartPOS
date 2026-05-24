const express = require("express");
const router = express.Router();
const {
  getCustomers, getCustomer, createCustomer,
  updateCustomer, deleteCustomer,
} = require("../../controllers/client/customerController");
const validate = require("../../middleware/common/validate");
const { createCustomerSchema, updateCustomerSchema } = require("../../validators/client/customerValidator");

router.get("/", getCustomers);
router.get("/:id", getCustomer);
router.post("/", validate(createCustomerSchema), createCustomer);
router.put("/:id", validate(updateCustomerSchema), updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;
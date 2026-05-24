const express = require("express");
const router = express.Router();
const { getMethods, updateMethods } = require("../../controllers/admin/paymentMethodController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validate = require("../../middleware/common/validate");
const { updateMethodsSchema } = require("../../validators/admin/paymentMethodValidator");

router.get("/", adminAuth, getMethods);
router.put("/", adminAuth, validate(updateMethodsSchema), updateMethods);

module.exports = router;
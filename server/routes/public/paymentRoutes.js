const express = require("express");
const router = express.Router();
const {
  initiatePayment, createPaymentIntent,
  createPayPalOrder, mpesaCallback, getPaymentStatus,
} = require("../../controllers/public/paymentController");
const { paymentLimiter } = require("../../middleware/common/rateLimiter");
const validate = require("../../middleware/common/validate");
const { initiatePaymentSchema } = require("../../validators/public/paymentValidator");

router.post("/initiate", paymentLimiter, validate(initiatePaymentSchema), initiatePayment);
router.post("/create-intent", paymentLimiter, createPaymentIntent);
router.post("/create-order", paymentLimiter, createPayPalOrder);
router.post("/mpesa/callback", mpesaCallback);
router.get("/:id/status", getPaymentStatus);

module.exports = router;
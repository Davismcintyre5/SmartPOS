// validators/public/paymentValidator.js
const Joi = require("joi");

const initiatePaymentSchema = Joi.object({
  clientId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().required(),
  method: Joi.string().valid("mpesa", "stripe", "paypal").required(),
  billingCycle: Joi.string().valid("monthly", "yearly", "permanent").required(),
  phone: Joi.string().optional().allow(""),
});

module.exports = { initiatePaymentSchema };
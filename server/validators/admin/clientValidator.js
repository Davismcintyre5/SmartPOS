const Joi = require("joi");

const updateClientSchema = Joi.object({
  businessName: Joi.string().trim(),
  ownerName: Joi.string().trim(),
  email: Joi.string().email().trim().lowercase(),
  phone: Joi.string().trim(),
  address: Joi.string().trim(),
  currency: Joi.string().valid("KES", "USD", "EUR", "GBP", "UGX", "TZS", "RWF", "BIF", "ZAR", "NGN", "GHS"),
});

module.exports = { updateClientSchema };
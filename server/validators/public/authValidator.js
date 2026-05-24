// validators/public/authValidator.js
const Joi = require("joi");

const registerSchema = Joi.object({
  businessName: Joi.string().required().trim(),
  ownerName: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string().trim().allow(""),
  password: Joi.string().min(6).required(),
  address: Joi.string().trim().allow(""),
  currency: Joi.string().valid("KES", "USD", "EUR", "GBP", "UGX", "TZS", "RWF", "BIF", "ZAR", "NGN", "GHS").default("KES"),
  plan: Joi.string().valid("trial", "monthly", "yearly", "permanent").default("trial"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required(),
});

const verifyLicenseSchema = Joi.object({
  licenseKey: Joi.string().required(),
  deviceId: Joi.string().optional(),
});

module.exports = { registerSchema, loginSchema, verifyLicenseSchema };
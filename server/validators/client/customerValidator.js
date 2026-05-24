// validators/client/customerValidator.js
const Joi = require("joi");

const createCustomerSchema = Joi.object({
  name: Joi.string().required().trim().messages({ "any.required": "Customer name is required" }),
  phone: Joi.string().trim().allow(""),
  email: Joi.string().email().allow("").trim().lowercase(),
  loyaltyCardNumber: Joi.string().trim().allow(""),
  loyaltyPoints: Joi.number().integer().min(0).default(0),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().trim(),
  phone: Joi.string().trim().allow(""),
  email: Joi.string().email().allow("").trim().lowercase(),
  loyaltyCardNumber: Joi.string().trim().allow(""),
  loyaltyPoints: Joi.number().integer().min(0),
}).min(1);

module.exports = { createCustomerSchema, updateCustomerSchema };
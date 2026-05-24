// validators/client/productValidator.js
const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().required().trim(),
  barcode: Joi.string().allow("").trim(),
  price: Joi.number().required().min(0),
  cost: Joi.number().min(0).default(0),
  stock: Joi.number().integer().min(0).default(0),
  category: Joi.string().trim().allow(""),
  lowStockThreshold: Joi.number().integer().min(0).default(10),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim(),
  barcode: Joi.string().allow("").trim(),
  price: Joi.number().min(0),
  cost: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  category: Joi.string().trim().allow(""),
  lowStockThreshold: Joi.number().integer().min(0),
}).min(1);

module.exports = { createProductSchema, updateProductSchema };
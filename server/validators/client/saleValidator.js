// validators/client/saleValidator.js
const Joi = require("joi");

const saleItemSchema = Joi.object({
  product: Joi.string(),
  productId: Joi.string(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().optional(),
}).or("product", "productId");

const processSaleSchema = Joi.object({
  items: Joi.array().items(saleItemSchema).min(1).required(),
  discount: Joi.number().min(0).default(0),
  paymentMethod: Joi.string().valid("cash", "mpesa", "card").required(),
  customerName: Joi.string().trim().allow(""),
  status: Joi.string().valid("completed", "held").default("completed"),
  customerId: Joi.string().optional().allow(null),
  vatRate: Joi.number().min(0).default(0),
  vatAmount: Joi.number().min(0).default(0),
  amountPaid: Joi.number().min(0).default(0),
  changeAmount: Joi.number().min(0).default(0),
  loyaltyCardNumber: Joi.string().trim().allow("").default(""),
});

const holdItemSchema = Joi.object({
  product: Joi.string(),
  productId: Joi.string(),
  name: Joi.string().allow(""),
  barcode: Joi.string().allow(""),
  price: Joi.number(),
  quantity: Joi.number().integer().min(1),
  total: Joi.number(),
}).or("product", "productId");

const holdSaleSchema = Joi.object({
  items: Joi.array().items(holdItemSchema).min(1).required(),
  discount: Joi.number().min(0).default(0),
  customerName: Joi.string().trim().allow(""),
  total: Joi.number().optional(),
});

const resumeSaleSchema = Joi.object({
  items: Joi.array().items(holdItemSchema),
  discount: Joi.number().min(0),
  paymentMethod: Joi.string().valid("cash", "mpesa", "card"),
  customerName: Joi.string().trim().allow(""),
});

const refundSaleSchema = Joi.object({
  reason: Joi.string().trim().allow(""),
});

module.exports = { processSaleSchema, holdSaleSchema, resumeSaleSchema, refundSaleSchema };
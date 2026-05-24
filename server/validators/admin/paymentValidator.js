const Joi = require("joi");

const approvePaymentSchema = Joi.object({
  auto: Joi.boolean().default(false),
});

const rejectPaymentSchema = Joi.object({
  reason: Joi.string().required(),
});

module.exports = { approvePaymentSchema, rejectPaymentSchema };
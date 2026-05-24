const Joi = require("joi");

const updatePlanSchema = Joi.object({
  priceMonthly: Joi.number().min(0),
  priceYearly: Joi.number().min(0),
  pricePermanent: Joi.number().min(0),
  currency: Joi.string().valid("KES", "USD", "EUR", "GBP"),
  freeTrialDays: Joi.number().integer().min(1).max(365),
});

module.exports = { updatePlanSchema };
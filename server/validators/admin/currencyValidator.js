const Joi = require("joi");

const updateCurrencySchema = Joi.object({
  baseCurrency: Joi.string().valid("KES", "USD", "EUR", "GBP").required(),
});

module.exports = { updateCurrencySchema };
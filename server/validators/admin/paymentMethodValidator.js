const Joi = require("joi");

const updateMethodsSchema = Joi.object({
  stripeEnabled: Joi.boolean(),
  stripePublishableKey: Joi.string().allow(""),
  stripeSecretKey: Joi.string().allow(""),
  mpesaEnabled: Joi.boolean(),
  mpesaShortCode: Joi.string().allow(""),
  mpesaMethods: Joi.object({
    stkPush: Joi.boolean(),
    sendMoney: Joi.boolean(),
    sendMoneyPhoneNumber: Joi.string().allow(""),
    till: Joi.boolean(),
    tillNumber: Joi.string().allow(""),
    tillBusinessName: Joi.string().allow(""),
    paybill: Joi.boolean(),
    paybillBusinessNumber: Joi.string().allow(""),
    paybillAccountName: Joi.string().allow(""),
  }),
  paypalEnabled: Joi.boolean(),
  paypalClientId: Joi.string().allow(""),
  paypalSecretKey: Joi.string().allow(""),
});

module.exports = { updateMethodsSchema };
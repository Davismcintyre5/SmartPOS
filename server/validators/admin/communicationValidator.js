const Joi = require("joi");

const updateCommunicationSchema = Joi.object({
  emailTemplates: Joi.object({
    trialLicense: Joi.string().allow(""),
    paymentApproved: Joi.string().allow(""),
    paymentRejected: Joi.string().allow(""),
  }),
  smsTemplates: Joi.object({
    trialLicense: Joi.string().allow(""),
  }),
});

module.exports = { updateCommunicationSchema };
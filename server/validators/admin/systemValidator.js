const Joi = require("joi");

const updateSystemSchema = Joi.object({
  appName: Joi.string().trim(),
  primaryColor: Joi.string().trim(),
  logoUrl: Joi.string().uri().allow(""),
  maintenanceMode: Joi.boolean(),
  mobileAppEnabled: Joi.boolean(),
  mobileAppUrl: Joi.string().uri().allow(""),
  desktopAppEnabled: Joi.boolean(),
  desktopAppUrl: Joi.string().uri().allow(""),
});

module.exports = { updateSystemSchema };
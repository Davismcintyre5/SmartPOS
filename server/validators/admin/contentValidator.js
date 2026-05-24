const Joi = require("joi");

const updateContentSchema = Joi.object({
  title: Joi.string().trim().allow(""),
  body: Joi.string().allow(""),
  mediaUrl: Joi.string().uri().allow(""),
  active: Joi.boolean(),
});

module.exports = { updateContentSchema };
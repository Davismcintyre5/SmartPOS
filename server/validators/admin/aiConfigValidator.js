const Joi = require("joi");

const updateAIConfigSchema = Joi.object({
  providers: Joi.array().items(
    Joi.object({
      name: Joi.string().valid("hdm", "deepseek", "chatgpt", "claude", "gemini").required(),
      enabled: Joi.boolean(),
      apiKey: Joi.string().allow(""),
      baseUrl: Joi.string().allow(""),  // Add this line
    })
  ),
  globalDefault: Joi.string().valid("hdm", "deepseek", "chatgpt", "claude", "gemini"),
  landingEnabled: Joi.boolean(),
  clientEnabled: Joi.boolean(),
  fileUploadEnabled: Joi.boolean(),
  outwardKeyEnabled: Joi.boolean(),
});

module.exports = { updateAIConfigSchema };
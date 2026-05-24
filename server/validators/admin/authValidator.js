const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required(),
});

const registerSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "superadmin").default("admin"),
});

module.exports = { loginSchema, registerSchema };
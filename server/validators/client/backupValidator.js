const Joi = require("joi");

const createBackupSchema = Joi.object({
  type: Joi.string().valid("manual", "scheduled").default("manual"),
});

module.exports = { createBackupSchema };
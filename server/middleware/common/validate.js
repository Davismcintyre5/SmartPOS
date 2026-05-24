const AppError = require("../../utils/AppError");

const validate = (schema) => (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((e) => ({
        field: e.path.join("."),
        message: e.message.replace(/"/g, ""),
      }));

      throw new AppError("Validation failed", 400);
    }

    req.body = value;
    next();
  } catch (err) {
    if (err.isOperational) {
      const errorDetails = err.message === "Validation failed" 
        ? err 
        : new AppError("Validation failed", 400);
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorDetails.errors || [err.message],
      });
    }
    next(err);
  }
};

module.exports = validate;
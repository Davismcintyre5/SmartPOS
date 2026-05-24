const logger = require("../config/logger");

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    logger.error("Unhandled async error", {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
    next(err);
  });
};

module.exports = catchAsync;
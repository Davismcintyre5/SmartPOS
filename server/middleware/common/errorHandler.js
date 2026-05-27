const logger = require("../../config/logger");
const env = require("../../config/env");

const errorHandler = (err, req, res, next) => {
  logger.error("Error", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = env.NODE_ENV === "production" ? "Something went wrong" : err.message;

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
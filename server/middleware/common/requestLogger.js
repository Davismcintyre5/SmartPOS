// middleware/common/requestLogger.js
const logger = require("../../config/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent") || "-",
    };

    if (statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`, logData);
    } else {
      logger.info(`${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`, logData);
    }
  });

  next();
};

module.exports = requestLogger;
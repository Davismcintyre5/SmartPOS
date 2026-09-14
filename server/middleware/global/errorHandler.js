const logger = require('../../utils/logger');
const env = require('../../config/env');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  if (statusCode >= 500) {
    logger.error({ err }, err.message);
  } else {
    logger.warn({ err: err.message }, err.message);
  }

  const body = {
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || null
  };

  if (err.details) body.details = err.details;

  if (env.NODE_ENV === 'development' && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
class ApiError extends Error {
  constructor(statusCode, message, code = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details = null) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message = 'Conflict', details = null) {
    return new ApiError(409, message, 'CONFLICT', details);
  }

  static paymentRequired(message = 'Payment required') {
    return new ApiError(402, message, 'PAYMENT_REQUIRED');
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}

module.exports = ApiError;
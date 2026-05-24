const AppError = require("../../utils/AppError");

const dataIsolation = (req, res, next) => {
  try {
    // Extract clientId from JWT (set by auth middleware)
    if (!req.user || !req.user.clientId) {
      throw new AppError("Client context missing", 401);
    }

    req.clientId = req.user.clientId;
    next();
  } catch (err) {
    if (err.isOperational) return next(err);
    next(new AppError("Data isolation failed", 403));
  }
};

module.exports = dataIsolation;
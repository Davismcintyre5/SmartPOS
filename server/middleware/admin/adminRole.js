const AppError = require("../../utils/AppError");

const adminRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!roles.includes(req.admin.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }

    next();
  };
};

module.exports = adminRole;
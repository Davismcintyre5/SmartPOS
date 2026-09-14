const ApiError = require('../../utils/ApiError');

function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.admin) {
      return next(ApiError.unauthorized('No admin context'));
    }

    if (!roles.includes(req.admin.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
}

module.exports = requireRole;
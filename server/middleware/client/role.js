const ApiError = require('../../utils/ApiError');

function requireTenantRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('No user context'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
}

module.exports = requireTenantRole;
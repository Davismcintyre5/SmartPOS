const ApiError = require('../../utils/ApiError');

function apiAccess(req, res, next) {
  if (!req.tenant) return next(ApiError.internal('Tenant not loaded'));

  if (req.tenant.plan !== 'ent') {
    return next(ApiError.forbidden('API access requires Enterprise plan'));
  }

  next();
}

module.exports = apiAccess;
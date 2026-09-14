const Client = require('../../models/admin/Client');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    if (payload.type !== 'client') {
      throw ApiError.forbidden('Not a client token');
    }

    const tenant = await Client.findById(payload.tenantId);
    if (!tenant) throw ApiError.unauthorized('Tenant not found');
    if (tenant.status === 'inactive') throw ApiError.forbidden('Account pending approval');

    req.user = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role
    };
    req.tenant = tenant;

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return next(ApiError.unauthorized('Invalid token'));
    if (err.name === 'TokenExpiredError') return next(ApiError.unauthorized('Token expired'));
    next(err);
  }
}

module.exports = auth;
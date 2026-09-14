const { verifyAccessToken } = require('../../utils/jwt');
const ApiError = require('../../utils/ApiError');

function adminAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    if (payload.type !== 'admin') {
      throw ApiError.forbidden('Not an admin token');
    }

    req.admin = {
      adminId: payload.adminId,
      role: payload.role,
      email: payload.email
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return next(ApiError.unauthorized('Invalid token'));
    if (err.name === 'TokenExpiredError') return next(ApiError.unauthorized('Token expired'));
    next(err);
  }
}

module.exports = adminAuth;
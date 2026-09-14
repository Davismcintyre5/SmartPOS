const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const { getCache } = require('../../config/redis');

const EXEMPT_PATHS = [
  '/',
  '/api',
  '/health',
  '/api/v1/admin',
  '/api/v1/site',
  '/api/v1/legal',
  '/api/v1/auth'
];

async function maintenance(req, res, next) {
  if (env.NODE_ENV === 'development') return next();

  const isExempt = EXEMPT_PATHS.some((p) => req.originalUrl.startsWith(p));
  if (isExempt) return next();

  try {
    const settings = await getCache('admin:settings');

    if (settings?.featureFlags?.maintenanceMode === true) {
      return next(new ApiError(
        503,
        settings.maintenanceMessage || 'SmartPOS is under maintenance. Please try again shortly.',
        'MAINTENANCE_MODE'
      ));
    }

    next();
  } catch (err) {
    next();
  }
}

module.exports = maintenance;
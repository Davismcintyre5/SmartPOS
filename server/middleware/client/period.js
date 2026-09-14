const ApiError = require('../../utils/ApiError');
const { PLAN_STATUSES } = require('../../utils/constants');

const ALLOWED_WHEN_BLOCKED = [
  '/api/v1/billing',
  '/api/v1/settings'
];

function period(req, res, next) {
  const tenant = req.tenant;
  if (!tenant) return next(ApiError.internal('Tenant not loaded'));

  if (tenant.plan === 'ent') return next();

  const now = new Date();
  const periodEnd = tenant.periodEnd ? new Date(tenant.periodEnd) : null;

  const isActive = tenant.status === 'active' && (!periodEnd || now < periodEnd);
  const isTrialing = tenant.status === 'trialing' && (!periodEnd || now < periodEnd);

  if (isActive || isTrialing) return next();

  if (tenant.status === 'renewal' || tenant.status === 'suspended') {
    const isBillingRoute = ALLOWED_WHEN_BLOCKED.some((p) => req.originalUrl.startsWith(p));
    if (isBillingRoute) return next();
  }

  return next(ApiError.paymentRequired('Subscription period has ended. Please renew.'));
}

module.exports = period;
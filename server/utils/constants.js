const PLANS = ['trial', 'starter', 'pro', 'ent'];

const PLAN_STATUSES = [
  'trialing',
  'active',
  'inactive',
  'renewal',
  'suspended',
  'canceled',
  'rejected',
  'perpetual'
];

const TENANT_ROLES = ['owner', 'manager', 'cashier'];

const ADMIN_ROLES = ['super_admin', 'admin', 'support', 'read_only'];

const PAYMENT_METHODS = [
  'stripe',
  'paypal',
  'mpesa_stk',
  'mpesa_send',
  'mpesa_paybill',
  'mpesa_till'
];

const PAYMENT_STATUSES = ['pending', 'succeeded', 'failed', 'refunded'];

const SYSTEM_CURRENCIES = ['KES', 'USD', 'EUR', 'GBP'];

const STORE_CURRENCIES = [
  'KES', 'USD', 'EUR', 'GBP',
  'TZS', 'UGX', 'NGN', 'GHS', 'RWF', 'BIF'
];

const SALE_STATUSES = ['completed', 'refunded', 'voided'];

const SYNC_ENTITIES = ['sale', 'payment', 'stock_movement'];

const STOCK_REASONS = ['sale', 'refund', 'adjustment', 'import', 'restock'];

const LEGAL_TYPES = ['terms', 'privacy', 'dpa', 'refund_policy', 'cookie_policy'];

const TRIAL_DAYS = 14;

const GRACE_DAYS = 14;

module.exports = {
  PLANS,
  PLAN_STATUSES,
  TENANT_ROLES,
  ADMIN_ROLES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SYSTEM_CURRENCIES,
  STORE_CURRENCIES,
  SALE_STATUSES,
  SYNC_ENTITIES,
  STOCK_REASONS,
  LEGAL_TYPES,
  TRIAL_DAYS,
  GRACE_DAYS
};
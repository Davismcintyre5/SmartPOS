export const ROLES = ['owner', 'manager', 'cashier'];

export const PAYMENT_METHODS = [
  'stripe',
  'paypal',
  'mpesa_stk',
  'mpesa_send',
  'mpesa_paybill',
  'mpesa_till'
];

export const SALE_STATUS = ['completed', 'refunded', 'voided'];

export const PLAN_STATUS = [
  'trialing',
  'active',
  'inactive',
  'renewal',
  'suspended',
  'canceled',
  'rejected',
  'perpetual'
];

export const STOCK_REASONS = ['sale', 'refund', 'adjustment', 'import', 'restock'];

export const PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export default {
  ROLES,
  PAYMENT_METHODS,
  SALE_STATUS,
  PLAN_STATUS,
  STOCK_REASONS,
  PAGE_SIZE,
  MAX_PAGE_SIZE
};
export const APP_NAME = 'SmartPOS';

export const USER_ROLES = ['owner', 'manager', 'cashier'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PAYMENT_METHODS = [
  { code: 'cash', label: 'Cash' },
  { code: 'mpesa_stk', label: 'M-Pesa STK' },
  { code: 'mpesa_send', label: 'M-Pesa Send' },
  { code: 'mpesa_paybill', label: 'M-Pesa Paybill' },
  { code: 'mpesa_till', label: 'M-Pesa Till' },
  { code: 'card', label: 'Card' },
  { code: 'bank', label: 'Bank Transfer' },
] as const;

export type PaymentMethodCode = (typeof PAYMENT_METHODS)[number]['code'];

export const POS_LOW_STOCK_THRESHOLD = 5;

export const PAGE_SIZE = 20;
export const PAGE_SIZE_LARGE = 50;

export const CART_MAX_QTY = 999;
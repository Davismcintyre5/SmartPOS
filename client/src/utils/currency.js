export const CURRENCY_SYMBOLS = {
  KES: 'KSh',
  USD: '$',
  EUR: '€',
  GBP: '£',
  TZS: 'TSh',
  UGX: 'USh',
  NGN: '₦',
  GHS: '₵',
  RWF: 'FRw',
  BIF: 'FBu'
};

export const SYSTEM_CURRENCIES = ['KES', 'USD', 'EUR', 'GBP'];

export const SUPPORTED_CURRENCIES = [
  'KES', 'USD', 'EUR', 'GBP',
  'TZS', 'UGX', 'NGN', 'GHS', 'RWF', 'BIF'
];

export function getCurrencySymbol(code) {
  return CURRENCY_SYMBOLS[code] || code || '';
}

export function isValidCurrency(code) {
  return SUPPORTED_CURRENCIES.includes(code);
}

export default {
  CURRENCY_SYMBOLS,
  SYSTEM_CURRENCIES,
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
  isValidCurrency
};
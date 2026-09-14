const CURRENCY_SYMBOLS = {
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

function toMinor(amount) {
  return Math.round(Number(amount) * 100);
}

function toMajor(amountMinor) {
  return amountMinor / 100;
}

function addMoney(a, b) {
  return a + b;
}

function subtractMoney(a, b) {
  return a - b;
}

function applyTax(amountMinor, rate, inclusive = false) {
  if (inclusive) {
    const tax = Math.round(amountMinor - amountMinor / (1 + rate / 100));
    return { tax, subtotal: amountMinor - tax, total: amountMinor };
  }
  const tax = Math.round(amountMinor * (rate / 100));
  return { tax, subtotal: amountMinor, total: amountMinor + tax };
}

function formatMoney(amountMinor, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const major = toMajor(amountMinor);
  const formatted = major.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol} ${formatted}`;
}

module.exports = {
  toMinor,
  toMajor,
  addMoney,
  subtractMoney,
  applyTax,
  formatMoney,
  CURRENCY_SYMBOLS
};
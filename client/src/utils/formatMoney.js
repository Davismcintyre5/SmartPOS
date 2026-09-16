import { getCurrencySymbol } from './currency';

export function toMinor(amount) {
  return Math.round(Number(amount) * 100);
}

export function toMajor(amountMinor) {
  return amountMinor / 100;
}

export function formatMoney(amountMinor, currency = 'KES') {
  const symbol = getCurrencySymbol(currency);
  const major = toMajor(amountMinor || 0);
  const formatted = major.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol} ${formatted}`;
}

export function formatPrice(amountMinor) {
  const major = toMajor(amountMinor || 0);
  return major.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function applyTax(amountMinor, rate = 0, inclusive = false) {
  if (!rate) {
    return { tax: 0, subtotal: amountMinor, total: amountMinor };
  }
  if (inclusive) {
    const tax = Math.round(amountMinor - amountMinor / (1 + rate / 100));
    return { tax, subtotal: amountMinor - tax, total: amountMinor };
  }
  const tax = Math.round(amountMinor * (rate / 100));
  return { tax, subtotal: amountMinor, total: amountMinor + tax };
}

export default {
  toMinor,
  toMajor,
  formatMoney,
  formatPrice,
  applyTax
};
const DEFAULT_CURRENCY = 'KES';

interface FormatMoneyOptions {
  decimals?: number;
}

export function formatMoney(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  options: FormatMoneyOptions = {}
): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const decimals = options.decimals ?? 2;

  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(safe);
  } catch {
    return `${currency} ${safe.toFixed(decimals)}`;
  }
}

export function formatNumber(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-KE').format(safe);
}

export function parseMoney(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9.\-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function currencySymbol(currency: string = DEFAULT_CURRENCY): string {
  try {
    const parts = new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? currency;
  } catch {
    return currency;
  }
}
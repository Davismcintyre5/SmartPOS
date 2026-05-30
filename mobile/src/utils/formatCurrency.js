// src/utils/formatCurrency.js
const symbols = {
  KES: "KSh", USD: "$", EUR: "€", GBP: "£",
  UGX: "USh", TZS: "TSh", RWF: "RF", BIF: "FBu",
  ZAR: "R", NGN: "₦", GHS: "GH₵",
};

export const formatCurrency = (amount, currency = "KES") => {
  const symbol = symbols[currency] || currency;
  const num = Number(amount);
  if (isNaN(num)) return `${symbol} 0`;
  return `${symbol} ${num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatPrice = (amount, currency = "KES") => {
  const symbol = symbols[currency] || currency;
  if (amount === 0) return `${symbol} 0`;
  return `${symbol} ${Number(amount).toLocaleString("en-KE")}`;
};
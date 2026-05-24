// utils/formatCurrency.js
import { storage } from "./storage";

const symbols = {
  KES: "KSh", USD: "$", EUR: "€", GBP: "£",
  UGX: "USh", TZS: "TSh", RWF: "RF", BIF: "FBu",
  ZAR: "R", NGN: "₦", GHS: "GH₵",
};

const getDefaultCurrency = () => {
  return storage.get("smartpos_currency") || "KES";
};

export const formatCurrency = (amount, currency) => {
  const c = currency || getDefaultCurrency();
  const symbol = symbols[c] || c;
  const num = Number(amount);
  if (isNaN(num)) return `${symbol} 0`;
  return `${symbol} ${num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatPrice = (amount, currency) => {
  const c = currency || getDefaultCurrency();
  const symbol = symbols[c] || c;
  if (amount === 0) return `${symbol} 0`;
  return `${symbol} ${Number(amount).toLocaleString("en-KE")}`;
};

export const getCurrencySymbol = (currency) => {
  const c = currency || getDefaultCurrency();
  return symbols[c] || c;
};
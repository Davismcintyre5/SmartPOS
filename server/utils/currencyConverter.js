const logger = require("../config/logger");

const currencySymbols = {
  KES: "KSh",
  USD: "$",
  EUR: "€",
  GBP: "£",
  UGX: "USh",
  TZS: "TSh",
  RWF: "RF",
  BIF: "FBu",
  ZAR: "R",
  NGN: "₦",
  GHS: "GH₵",
};

// Static rates (updated manually or via cron job)
const exchangeRates = {
  KES: 1,
  USD: 0.0077,
  EUR: 0.0071,
  GBP: 0.0061,
  UGX: 28.5,
  TZS: 19.5,
  RWF: 9.8,
  BIF: 21.5,
  ZAR: 0.14,
  NGN: 12.0,
  GHS: 0.098,
};

const convertCurrency = (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];

    if (!fromRate || !toRate) {
      logger.warn(`Unknown currency conversion: ${fromCurrency} → ${toCurrency}`);
      return amount;
    }

    const inKES = amount / fromRate;
    const converted = inKES * toRate;

    return Math.round(converted * 100) / 100;
  } catch (err) {
    logger.error("Currency conversion failed", { error: err.message });
    return amount;
  }
};

const getSymbol = (currency) => currencySymbols[currency] || currency;

const getAvailableCurrencies = () => Object.keys(currencySymbols);

module.exports = { convertCurrency, getSymbol, getAvailableCurrencies, exchangeRates };
const ClientCurrency = require("../../models/client/Currency");
const { getAvailableCurrencies, getSymbol } = require("../../utils/currencyConverter");

const getClientCurrency = async (clientId) => {
  let setting = await ClientCurrency.findOne({ clientId }).lean();
  if (!setting) setting = { currency: "KES" };
  return { currency: setting.currency, available: getAvailableCurrencies(), symbol: getSymbol(setting.currency) };
};

const updateClientCurrency = async (clientId, currency) => {
  const available = getAvailableCurrencies();
  if (!available.includes(currency)) throw new AppError("Invalid currency", 400);
  const setting = await ClientCurrency.findOneAndUpdate(
    { clientId },
    { currency },
    { upsert: true, new: true }
  );
  return setting;
};

module.exports = { getClientCurrency, updateClientCurrency };
const Subscription = require("../../models/admin/Subscription");
const Currency = require("../../models/admin/Currency");
const { convertCurrency } = require("../../utils/currencyConverter");

const getPlan = async () => {
  let plan = await Subscription.findOne().lean();
  if (!plan) plan = await Subscription.create({});

  const currencySetting = await Currency.findOne().lean();
  const base = currencySetting?.baseCurrency || "KES";

  if (base !== "KES") {
    plan = { ...plan };
    plan.priceMonthly = convertCurrency(plan.priceMonthly, "KES", base);
    plan.priceYearly = convertCurrency(plan.priceYearly, "KES", base);
    plan.pricePermanent = convertCurrency(plan.pricePermanent, "KES", base);
    plan.currency = base;
  }

  return plan;
};

const updatePlan = async (data) => {
  return Subscription.findOneAndUpdate({}, data, { upsert: true, new: true, runValidators: true });
};

module.exports = { getPlan, updatePlan };
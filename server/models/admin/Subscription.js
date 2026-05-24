const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    priceMonthly: {
      type: Number,
      default: 500,
    },
    priceYearly: {
      type: Number,
      default: 5000,
    },
    pricePermanent: {
      type: Number,
      default: 12000,
    },
    currency: {
      type: String,
      enum: ["KES", "USD", "EUR", "GBP"],
      default: "KES",
    },
    freeTrialDays: {
      type: Number,
      default: 14,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
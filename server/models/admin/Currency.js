const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    baseCurrency: {
      type: String,
      enum: ["KES", "USD", "EUR", "GBP"],
      default: "KES",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Currency", currencySchema);
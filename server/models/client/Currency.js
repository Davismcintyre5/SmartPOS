const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      unique: true,
    },
    currency: {
      type: String,
      enum: ["KES", "USD", "EUR", "GBP", "UGX", "TZS", "RWF", "BIF", "ZAR", "NGN", "GHS"],
      default: "KES",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientCurrency", currencySchema);
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "KES",
    },
    method: {
      type: String,
      enum: ["mpesa", "stripe", "paypal", "manual"],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "permanent"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    transactionId: String,
    mpesaReceipt: String,
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
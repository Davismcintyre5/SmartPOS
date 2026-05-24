const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["trial", "monthly", "yearly", "permanent"],
      default: "trial",
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: Date,
    trialEndDate: Date,
    paymentHistory: [
      {
        amount: Number,
        method: String,
        transactionId: String,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientSubscription", subscriptionSchema);
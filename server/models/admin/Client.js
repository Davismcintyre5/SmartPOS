const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      default: "KES",
    },
    plan: {
      type: String,
      enum: ["trial", "monthly", "yearly", "permanent"],
      default: "trial",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
    },
    licenseKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    subscriptionExpiry: {
      type: Date,
    },
    devices: [
      {
        deviceId: String,
        activatedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
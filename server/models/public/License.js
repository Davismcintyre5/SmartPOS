const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    licenseKey: {
      type: String,
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["trial", "monthly", "yearly", "permanent"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
    },
    devices: [
      {
        deviceId: String,
        deviceName: String,
        activatedAt: Date,
        lastSeen: Date,
      },
    ],
    maxDevices: {
      type: Number,
      default: 5,
    },
    activatedAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("License", licenseSchema);
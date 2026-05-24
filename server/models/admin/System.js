const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: "SmartPOS",
    },
    primaryColor: {
      type: String,
      default: "#2563eb",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    mobileAppEnabled: {
      type: Boolean,
      default: false,
    },
    mobileAppUrl: {
      type: String,
      default: "",
    },
    desktopAppEnabled: {
      type: Boolean,
      default: false,
    },
    desktopAppUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("System", systemSchema);
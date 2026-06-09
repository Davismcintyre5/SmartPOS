// models/admin/System.js
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
    maintenanceMessage: {
      type: String,
      default: "System is currently under maintenance. Please check back later.",
    },
    maintenanceStartTime: {
      type: Date,
      default: null,
    },
    maintenanceEndTime: {
      type: Date,
      default: null,
    },
    maintenanceReason: {
      type: String,
      default: "Scheduled maintenance",
    },
    estimatedDuration: {
      type: String,
      default: "2 hours",
    },
    maintenanceNotified: {
      type: Boolean,
      default: false,
    },
    supportEmail: {
      type: String,
      default: "support@smartpos.com",
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
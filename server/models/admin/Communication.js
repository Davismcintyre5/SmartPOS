const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema(
  {
    emailTemplates: {
      trialLicense: { type: String, default: "" },
      paymentApproved: { type: String, default: "" },
      paymentRejected: { type: String, default: "" },
    },
    smsTemplates: {
      trialLicense: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Communication", communicationSchema);
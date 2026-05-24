const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    stripeEnabled: { type: Boolean, default: false },
    stripePublishableKey: { type: String, default: "" },
    stripeSecretKey: { type: String, default: "" },

    mpesaEnabled: { type: Boolean, default: false },
    mpesaShortCode: { type: String, default: "" },
    mpesaMethods: {
      stkPush: { type: Boolean, default: false },
      sendMoney: { type: Boolean, default: false },
      sendMoneyPhoneNumber: { type: String, default: "" },
      till: { type: Boolean, default: false },
      tillNumber: { type: String, default: "" },
      tillBusinessName: { type: String, default: "" },
      paybill: { type: Boolean, default: false },
      paybillBusinessNumber: { type: String, default: "" },
      paybillAccountName: { type: String, default: "" },
    },

    paypalEnabled: { type: Boolean, default: false },
    paypalClientId: { type: String, default: "" },
    paypalSecretKey: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
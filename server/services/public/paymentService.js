// services/public/paymentService.js
const Payment = require("../../models/admin/Payment");
const Client = require("../../models/admin/Client");
const License = require("../../models/public/License");
const mpesa = require("../../utils/mpesaHelper");
const stripeHelper = require("../../utils/stripeHelper");
const paypalHelper = require("../../utils/paypalHelper");
const env = require("../../config/env");
const AppError = require("../../utils/AppError");
const logger = require("../../config/logger");

const initiatePayment = async ({ clientId, amount, currency, method, billingCycle, phone }) => {
  if (!clientId) throw new AppError("Client ID is required", 400);

  const client = await Client.findById(clientId);
  if (!client) throw new AppError("Client not found", 404);

  const payment = await Payment.create({
    client: clientId,
    amount,
    currency: currency || "KES",
    method: method || "mpesa",
    billingCycle: billingCycle || "monthly",
    status: "pending",
  });

  if (method === "mpesa" && phone) {
    try {
      const result = await mpesa.stkPush(phone, amount, `SmartPOS-${billingCycle}`, `${billingCycle} subscription`);
      if (result.success) {
        payment.transactionId = result.checkoutRequestID;
        await payment.save();
      }
    } catch (err) {
      logger.error("M-Pesa push failed", { error: err.message });
    }
  }

  return { success: true, paymentId: payment._id };
};

const handleMpesaCallback = async (body) => {
  logger.info("M-Pesa callback received", { body });
};

module.exports = { initiatePayment, handleMpesaCallback };
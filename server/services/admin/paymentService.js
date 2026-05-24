// services/admin/paymentService.js
const Payment = require("../../models/admin/Payment");
const Client = require("../../models/admin/Client");
const User = require("../../models/client/User");
const License = require("../../models/public/License");
const { generateLicenseKey } = require("../../utils/licenseGenerator");
const emailService = require("../public/emailService");
const AppError = require("../../utils/AppError");
const logger = require("../../config/logger");

const getPendingPayments = async () => {
  return Payment.find({ status: "pending" })
    .populate("client", "businessName email ownerName phone")
    .sort("-createdAt")
    .lean();
};

const getAllPayments = async (page = 1, limit = 30) => {
  const [payments, count] = await Promise.all([
    Payment.find()
      .populate("client", "businessName email ownerName")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Payment.countDocuments(),
  ]);
  return { payments, count, page: Number(page), pages: Math.ceil(count / limit) };
};

const approvePayment = async (paymentId, adminId) => {
  const payment = await Payment.findById(paymentId).populate("client");
  if (!payment) throw new AppError("Payment not found", 404);
  if (payment.status !== "pending") throw new AppError("Payment already processed", 400);

  payment.status = "approved";
  payment.approvedBy = adminId;
  payment.approvedAt = new Date();
  await payment.save();

  const client = payment.client;
  if (!client) throw new AppError("Client not linked to this payment", 400);

  if (!client.licenseKey) client.licenseKey = generateLicenseKey();

  const now = new Date();
  let expiry = null;
  if (payment.billingCycle === "monthly") expiry = new Date(now.setMonth(now.getMonth() + 1));
  else if (payment.billingCycle === "yearly") expiry = new Date(now.setFullYear(now.getFullYear() + 1));
  else if (payment.billingCycle === "permanent") expiry = new Date("2099-12-31");

  client.status = "active";
  client.plan = payment.billingCycle;
  client.subscriptionExpiry = expiry;
  await client.save();

  await User.updateMany({ clientId: client._id }, { active: true });

  await License.findOneAndUpdate(
    { clientId: client._id },
    { licenseKey: client.licenseKey, plan: payment.billingCycle, status: "active", expiresAt: expiry },
    { upsert: true, new: true }
  );

  try {
    await emailService.sendPaymentApproved(client.email, client.businessName, client.licenseKey);
  } catch (err) {
    logger.error("Failed to send approval email", { error: err.message });
  }

  return payment;
};

const rejectPayment = async (paymentId, reason) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError("Payment not found", 404);
  if (payment.status !== "pending") throw new AppError("Payment already processed", 400);

  payment.status = "rejected";
  payment.reason = reason;
  await payment.save();

  const client = await Client.findById(payment.client);
  if (client) {
    try {
      await emailService.sendPaymentRejected(client.email, client.businessName, reason);
    } catch (err) {
      logger.error("Failed to send rejection email", { error: err.message });
    }
  }

  return payment;
};

const deleteApprovedPayments = async () => {
  const result = await Payment.deleteMany({ status: "approved" });
  logger.info(`Deleted ${result.deletedCount} approved payments`);
  return result;
};

const deleteRejectedPayments = async () => {
  const result = await Payment.deleteMany({ status: "rejected" });
  logger.info(`Deleted ${result.deletedCount} rejected payments`);
  return result;
};

const deletePayment = async (id) => {
  const payment = await Payment.findByIdAndDelete(id);
  if (!payment) throw new AppError("Payment not found", 404);
  return payment;
};

module.exports = { getPendingPayments, getAllPayments, approvePayment, rejectPayment, deleteApprovedPayments, deleteRejectedPayments, deletePayment };
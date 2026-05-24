// controllers/admin/paymentController.js
const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const paymentService = require("../../services/admin/paymentService");

// @desc    Get pending payments
// @route   GET /api/admin/payments/pending
// @access  Private (Admin)
const getPendingPayments = catchAsync(async (req, res) => {
  const payments = await paymentService.getPendingPayments();
  success(res, { payments });
});

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private (Admin)
const getAllPayments = catchAsync(async (req, res) => {
  const result = await paymentService.getAllPayments(req.query.page, req.query.limit);
  success(res, result);
});

// @desc    Approve payment
// @route   PUT /api/admin/payments/:id/approve
// @access  Private (Admin)
const approvePayment = catchAsync(async (req, res) => {
  const payment = await paymentService.approvePayment(req.params.id, req.admin._id);
  success(res, { payment }, "Payment approved");
});

// @desc    Reject payment
// @route   PUT /api/admin/payments/:id/reject
// @access  Private (Admin)
const rejectPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.rejectPayment(req.params.id, req.body.reason);
  success(res, { payment }, "Payment rejected");
});

// @desc    Delete all approved payments
// @route   DELETE /api/admin/payments/approved
// @access  Private (Admin)
const deleteApproved = catchAsync(async (req, res) => {
  await paymentService.deleteApprovedPayments();
  success(res, null, "All approved payments deleted");
});

// @desc    Delete all rejected payments
// @route   DELETE /api/admin/payments/rejected
// @access  Private (Admin)
const deleteRejected = catchAsync(async (req, res) => {
  await paymentService.deleteRejectedPayments();
  success(res, null, "All rejected payments deleted");
});

// @desc    Delete a single payment
// @route   DELETE /api/admin/payments/:id
// @access  Private (Admin)
const deletePayment = catchAsync(async (req, res) => {
  await paymentService.deletePayment(req.params.id);
  success(res, null, "Payment deleted");
});

module.exports = { getPendingPayments, getAllPayments, approvePayment, rejectPayment, deleteApproved, deleteRejected, deletePayment };
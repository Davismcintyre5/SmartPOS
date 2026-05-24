// routes/admin/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  getPendingPayments, getAllPayments,
  approvePayment, rejectPayment,
  deleteApproved, deleteRejected, deletePayment,
} = require("../../controllers/admin/paymentController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validate = require("../../middleware/common/validate");
const { approvePaymentSchema, rejectPaymentSchema } = require("../../validators/admin/paymentValidator");

router.get("/pending", adminAuth, getPendingPayments);
router.get("/", adminAuth, getAllPayments);
router.put("/:id/approve", adminAuth, validate(approvePaymentSchema), approvePayment);
router.put("/:id/reject", adminAuth, validate(rejectPaymentSchema), rejectPayment);
router.delete("/approved", adminAuth, deleteApproved);
router.delete("/rejected", adminAuth, deleteRejected);
router.delete("/:id", adminAuth, deletePayment);

module.exports = router;
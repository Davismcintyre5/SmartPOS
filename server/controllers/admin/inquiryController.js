const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const Inquiry = require("../../models/public/Inquiry");

// @desc    Get all inquiries
// @route   GET /api/admin/inquiries
// @access  Private (Admin)
const getInquiries = catchAsync(async (req, res) => {
  const inquiries = await Inquiry.find().sort("-createdAt").lean();
  success(res, { inquiries });
});

// @desc    Resolve inquiry
// @route   PUT /api/admin/inquiries/:id/resolve
// @access  Private (Admin)
const resolveInquiry = catchAsync(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { resolved: true, resolvedBy: req.admin._id, resolvedAt: new Date() },
    { new: true }
  );
  success(res, { inquiry }, "Inquiry resolved");
});

// @desc    Delete inquiry
// @route   DELETE /api/admin/inquiries/:id
// @access  Private (Admin)
const deleteInquiry = catchAsync(async (req, res) => {
  await Inquiry.findByIdAndDelete(req.params.id);
  success(res, null, "Inquiry deleted");
});

module.exports = { getInquiries, resolveInquiry, deleteInquiry };
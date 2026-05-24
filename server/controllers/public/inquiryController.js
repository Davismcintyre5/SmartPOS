const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const Inquiry = require("../../models/public/Inquiry");

// @desc    Submit contact inquiry
// @route   POST /api/public/landing/inquiry
// @access  Public
const submitInquiry = catchAsync(async (req, res) => {
  const inquiry = await Inquiry.create(req.body);
  success(res, null, "Inquiry submitted", 201);
});

module.exports = { submitInquiry };
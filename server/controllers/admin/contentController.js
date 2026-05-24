const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const Content = require("../../models/public/Content");

// @desc    Get all content
// @route   GET /api/admin/content
// @access  Private (Admin)
const getAllContent = catchAsync(async (req, res) => {
  const content = await Content.find().lean();
  success(res, { content });
});

// @desc    Update section content
// @route   PUT /api/admin/content/:section
// @access  Private (Admin)
const updateContent = catchAsync(async (req, res) => {
  const content = await Content.findOneAndUpdate(
    { section: req.params.section },
    req.body,
    { upsert: true, new: true, runValidators: true }
  );
  success(res, { content }, "Content updated");
});

// @desc    Delete section content
// @route   DELETE /api/admin/content/:section
// @access  Private (Admin)
const deleteContent = catchAsync(async (req, res) => {
  await Content.findOneAndDelete({ section: req.params.section });
  success(res, null, "Content deleted");
});

module.exports = { getAllContent, updateContent, deleteContent };
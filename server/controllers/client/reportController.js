const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const reportService = require("../../services/client/reportService");

// @desc    Get sales report
// @route   GET /api/client/reports/sales
// @access  Private (Client)
const getSalesReport = catchAsync(async (req, res) => {
  const data = await reportService.getSalesReport(req.clientId, req.query.period);
  success(res, data);
});

// @desc    Get inventory report
// @route   GET /api/client/reports/inventory
// @access  Private (Client)
const getInventoryReport = catchAsync(async (req, res) => {
  const data = await reportService.getInventoryReport(req.clientId);
  success(res, data);
});

module.exports = { getSalesReport, getInventoryReport };
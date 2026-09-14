const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const health = asyncHandler(async (req, res) => {
  return success(res, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }, 'OK');
});

const ready = asyncHandler(async (req, res) => {
  return success(res, { ready: true }, 'Ready');
});

module.exports = { health, ready };
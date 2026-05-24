const System = require("../../models/admin/System");

const maintenance = async (req, res, next) => {
  try {
    const settings = await System.findOne().lean();
    if (settings && settings.maintenanceMode) {
      return res.status(503).json({ success: false, message: "System is under maintenance" });
    }
    next();
  } catch {
    next();
  }
};

module.exports = maintenance;
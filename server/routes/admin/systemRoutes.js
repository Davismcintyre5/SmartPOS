// routes/admin/systemRoutes.js
const express = require("express");
const router = express.Router();
const { 
  getSettings, 
  updateSettings, 
  enableMaintenance, 
  disableMaintenance, 
  getMaintenanceStatus 
} = require("../../controllers/admin/systemController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validate = require("../../middleware/common/validate");
const { updateSystemSchema } = require("../../validators/admin/systemValidator");

router.get("/", adminAuth, getSettings);
router.put("/", adminAuth, validate(updateSystemSchema), updateSettings);

// Maintenance routes
router.get("/maintenance/status", adminAuth, getMaintenanceStatus);
router.post("/maintenance/enable", adminAuth, enableMaintenance);
router.post("/maintenance/disable", adminAuth, disableMaintenance);

module.exports = router;
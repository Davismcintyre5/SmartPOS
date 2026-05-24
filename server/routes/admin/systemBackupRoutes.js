const express = require("express");
const router = express.Router();
const { getBackups, createBackup, downloadBackup, deleteBackup } = require("../../controllers/admin/systemBackupController");
const adminAuth = require("../../middleware/admin/adminAuth");
const adminRole = require("../../middleware/admin/adminRole");

router.get("/", adminAuth, getBackups);
router.post("/", adminAuth, adminRole("superadmin"), createBackup);
router.get("/:id/download", adminAuth, downloadBackup);
router.delete("/:id", adminAuth, adminRole("superadmin"), deleteBackup);

module.exports = router;
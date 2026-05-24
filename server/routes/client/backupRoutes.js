const express = require("express");
const router = express.Router();
const { createBackup, getBackups } = require("../../controllers/client/backupController");
const validate = require("../../middleware/common/validate");
const { createBackupSchema } = require("../../validators/client/backupValidator");

router.post("/", validate(createBackupSchema), createBackup);
router.get("/", getBackups);

module.exports = router;
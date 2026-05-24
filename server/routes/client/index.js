// routes/client/index.js
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/common/auth");
const licenseCheck = require("../../middleware/client/licenseCheck");
const dataIsolation = require("../../middleware/client/dataIsolation");

router.use(auth);
router.use(dataIsolation);
router.use(licenseCheck);

router.use("/dashboard", require("./dashboardRoutes"));
router.use("/pos", require("./posRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/sales", require("./saleRoutes"));
router.use("/customers", require("./customerRoutes"));
router.use("/reports", require("./reportRoutes"));
router.use("/api-keys", require("./apiKeyRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/currency", require("./currencyRoutes"));
router.use("/ai", require("./aiRoutes"));
router.use("/subscription", require("./subscriptionRoutes"));
router.use("/backups", require("./backupRoutes"));
router.use("/settings", require("./settingsRoutes"));

module.exports = router;
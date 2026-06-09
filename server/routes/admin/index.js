const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/clients", require("./clientRoutes"));
router.use("/subscription", require("./subscriptionRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/payment-methods", require("./paymentMethodRoutes"));
router.use("/currency", require("./currencyRoutes"));
router.use("/ai-config", require("./aiConfigRoutes"));
router.use("/communication", require("./communicationRoutes"));
router.use("/system", require("./systemRoutes"));
router.use("/system-backups", require("./systemBackupRoutes"));
router.use("/content", require("./contentRoutes"));
router.use("/inquiries", require("./inquiryRoutes"));
router.use("/email", require("./emailRoutes"));

module.exports = router;
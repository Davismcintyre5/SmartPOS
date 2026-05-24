// routes/public/index.js
const express = require("express");
const router = express.Router();
const maintenance = require("../../middleware/common/maintenance");
const { generalLimiter } = require("../../middleware/common/rateLimiter");

router.use(generalLimiter);

// Apply maintenance to all routes EXCEPT system routes
router.use("/landing", maintenance, require("./landingRoutes"));
router.use("/auth", maintenance, require("./authRoutes"));
router.use("/payments", maintenance, require("./paymentRoutes"));
router.use("/chat", maintenance, require("./chatRoutes"));
// System routes WITHOUT maintenance check (so frontend can check status)
router.use("/system", require("./systemRoutes"));

module.exports = router;
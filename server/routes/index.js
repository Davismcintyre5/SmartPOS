const express = require("express");
const router = express.Router();

const publicRoutes = require("./public/index");
const clientRoutes = require("./client/index");
const adminRoutes = require("./admin/index");

router.use("/public", publicRoutes);
router.use("/client", clientRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
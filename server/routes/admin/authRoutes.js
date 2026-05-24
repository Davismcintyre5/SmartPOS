const express = require("express");
const router = express.Router();
const { login, getMe, register } = require("../../controllers/admin/authController");
const adminAuth = require("../../middleware/admin/adminAuth");
const adminRole = require("../../middleware/admin/adminRole");
const validate = require("../../middleware/common/validate");
const { loginSchema, registerSchema } = require("../../validators/admin/authValidator");
const { authLimiter } = require("../../middleware/common/rateLimiter");

router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", adminAuth, getMe);
router.post("/register", adminAuth, adminRole("superadmin"), validate(registerSchema), register);

module.exports = router;
const express = require("express");
const router = express.Router();
const { register, registerPending, login, verifyLicense, forgotPassword, resetPassword } = require("../../controllers/public/authController");
const { authLimiter } = require("../../middleware/common/rateLimiter");
const validate = require("../../middleware/common/validate");
const { registerSchema, loginSchema, verifyLicenseSchema } = require("../../validators/public/authValidator");

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/register-pending", authLimiter, validate(registerSchema), registerPending);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/verify-license", validate(verifyLicenseSchema), verifyLicense);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
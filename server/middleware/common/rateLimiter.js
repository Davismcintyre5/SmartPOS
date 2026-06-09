// middleware/common/rateLimiter.js
const rateLimit = require("express-rate-limit");

// Trust proxy is enabled in server.js (app.set("trust proxy", 1))
// This allows rate limiter to work correctly behind Cloudflare/Render

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  validate: { xForwardedForHeader: true }, // Will work because trust proxy is set
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes
  message: { success: false, message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: true },
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 payment attempts per minute
  message: { success: false, message: "Too many payment attempts, please wait" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: true },
});

module.exports = { generalLimiter, authLimiter, paymentLimiter };
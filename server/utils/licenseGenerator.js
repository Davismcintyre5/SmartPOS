const crypto = require("crypto");
const logger = require("../config/logger");

const generateLicenseKey = () => {
  try {
    const segments = [];
    for (let i = 0; i < 6; i++) {
      segments.push(crypto.randomBytes(2).toString("hex").toUpperCase());
    }
    return `SMART-${segments.join("-")}`;
  } catch (err) {
    logger.error("License generation failed", { error: err.message });
    // Fallback non-crypto
    const fallback = Array(6)
      .fill(0)
      .map(() => Math.random().toString(16).slice(2, 6).toUpperCase())
      .join("-");
    return `SMART-${fallback}`;
  }
};

const isValidLicenseFormat = (key) => {
  const pattern = /^SMART-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
  return pattern.test(key);
};

module.exports = { generateLicenseKey, isValidLicenseFormat };
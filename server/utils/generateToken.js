const jwt = require("jsonwebtoken");
const env = require("../config/env");
const logger = require("../config/logger");

const generateToken = (payload) => {
  try {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRE,
    });
  } catch (err) {
    logger.error("Token generation failed", { error: err.message });
    throw err;
  }
};

const generateAdminToken = (admin) => {
  return generateToken({
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    type: "admin",
  });
};

const generateClientToken = (user) => {
  return generateToken({
    id: user._id,
    clientId: user.clientId,
    name: user.name,
    role: user.role,
    type: "client",
  });
};

module.exports = { generateToken, generateAdminToken, generateClientToken };
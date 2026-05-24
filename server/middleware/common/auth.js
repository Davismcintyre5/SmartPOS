const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const AppError = require("../../utils/AppError");

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(new AppError("Authentication failed", 401));
  }
};

module.exports = auth;
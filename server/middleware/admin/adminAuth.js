const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const AppError = require("../../utils/AppError");
const Admin = require("../../models/admin/Admin");

const adminAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (decoded.type !== "admin") {
      throw new AppError("Invalid token type", 401);
    }

    const admin = await Admin.findById(decoded.id).select("-password").lean();
    if (!admin) {
      throw new AppError("Admin not found", 401);
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.isOperational) return next(err);
    return next(new AppError("Authentication failed", 401));
  }
};

module.exports = adminAuth;
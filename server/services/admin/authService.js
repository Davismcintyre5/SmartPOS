const jwt = require("jsonwebtoken");
const Admin = require("../../models/admin/Admin");
const AppError = require("../../utils/AppError");
const env = require("../../config/env");

const login = async (email, password) => {
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin || !(await admin.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }
  const token = jwt.sign(
    { id: admin._id, name: admin.name, email: admin.email, role: admin.role, type: "admin" },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE }
  );
  return { admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }, token };
};

const getMe = async (adminId) => {
  const admin = await Admin.findById(adminId).select("-password");
  if (!admin) throw new AppError("Admin not found", 404);
  return admin;
};

const register = async (data) => {
  const existing = await Admin.findOne({ email: data.email });
  if (existing) throw new AppError("Email already in use", 409);
  const admin = await Admin.create(data);
  return { id: admin._id, name: admin.name, email: admin.email, role: admin.role };
};

module.exports = { login, getMe, register };
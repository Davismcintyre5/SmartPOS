const AppError = require("../../utils/AppError");
const Client = require("../../models/admin/Client");

const licenseCheck = async (req, res, next) => {
  try {
    // Skip if no clientId (should be set by dataIsolation)
    if (!req.clientId) {
      throw new AppError("Client context missing", 401);
    }

    const client = await Client.findById(req.clientId).lean();

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    if (client.status === "suspended") {
      throw new AppError("Account is suspended. Contact support.", 403);
    }

    if (client.status === "inactive") {
      throw new AppError("Account is inactive. Please activate your license.", 403);
    }

    // Check subscription expiry
    if (client.subscriptionExpiry && new Date(client.subscriptionExpiry) < new Date()) {
      throw new AppError("Subscription expired. Please renew.", 403);
    }

    req.client = client;
    next();
  } catch (err) {
    if (err.isOperational) return next(err);
    next(new AppError("License validation failed", 403));
  }
};

module.exports = licenseCheck;
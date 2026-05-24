const License = require("../../models/public/License");
const Client = require("../../models/admin/Client");
const { generateLicenseKey } = require("../../utils/licenseGenerator");
const AppError = require("../../utils/AppError");

const createTrialLicense = async (clientId) => {
  const client = await Client.findById(clientId);
  if (!client) throw new AppError("Client not found", 404);

  const key = generateLicenseKey();
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const license = await License.create({
    clientId,
    licenseKey: key,
    plan: "trial",
    status: "active",
    activatedAt: new Date(),
    expiresAt: trialEnd,
  });

  // Update client
  client.licenseKey = key;
  client.status = "active";
  client.plan = "trial";
  client.subscriptionExpiry = trialEnd;
  await client.save();

  return license;
};

const verifyLicense = async (licenseKey, deviceId) => {
  const license = await License.findOne({ licenseKey, status: "active" });
  if (!license) throw new AppError("Invalid or expired license key", 400);

  if (license.expiresAt && new Date() > license.expiresAt) {
    license.status = "expired";
    await license.save();
    throw new AppError("License has expired", 400);
  }

  // Check device limit
  if (license.devices.length >= license.maxDevices) {
    const existingDevice = license.devices.find((d) => d.deviceId === deviceId);
    if (!existingDevice) throw new AppError("Maximum device limit reached", 400);
  }

  // Register device if not existing
  const deviceExists = license.devices.find((d) => d.deviceId === deviceId);
  if (!deviceExists) {
    license.devices.push({ deviceId, activatedAt: new Date(), lastSeen: new Date() });
  } else {
    // Update last seen
    license.devices = license.devices.map((d) =>
      d.deviceId === deviceId ? { ...d, lastSeen: new Date() } : d
    );
  }
  await license.save();

  const client = await Client.findById(license.clientId);
  return { valid: true, clientId: client._id, businessName: client.businessName, plan: license.plan };
};

module.exports = { createTrialLicense, verifyLicense };
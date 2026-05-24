const cloudinary = require("cloudinary").v2;
const env = require("./env");
const logger = require("./logger");

const configureCloudinary = () => {
  if (!env.CLOUDINARY_CLOUD_NAME) {
    logger.warn("Cloudinary not configured — image uploads disabled");
    return false;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  logger.info("Cloudinary configured");
  return true;
};

module.exports = { cloudinary, configureCloudinary };
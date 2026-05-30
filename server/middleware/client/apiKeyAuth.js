// middleware/client/apiKeyAuth.js
const ApiKey = require("../../models/client/ApiKey");

const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  
  if (!apiKey) return next(); // No API key — fall through to JWT auth
  
  try {
    const key = await ApiKey.findOne({ key: apiKey, active: true });
    if (!key) {
      return res.status(401).json({ success: false, message: "Invalid API key" });
    }
    
    req.clientId = key.clientId;
    req.isApiKey = true;
    req.user = { clientId: key.clientId }; // Set user for downstream middleware
    
    await ApiKey.findByIdAndUpdate(key._id, { lastUsed: new Date() });
    
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

module.exports = apiKeyAuth;
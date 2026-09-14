const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { getCache } = require('../config/redis');

let expiries = {
  accessExpires: env.JWT_ACCESS_EXPIRES,
  refreshExpires: env.JWT_REFRESH_EXPIRES
};

async function refreshExpiries() {
  try {
    const settings = await getCache('admin:settings');
    if (settings?.security) {
      if (settings.security.accessTokenMinutes) {
        expiries.accessExpires = `${settings.security.accessTokenMinutes}m`;
      }
      if (settings.security.refreshTokenDays) {
        expiries.refreshExpires = `${settings.security.refreshTokenDays}d`;
      }
    }
  } catch { /* keep env defaults */ }
}

refreshExpiries();
setInterval(refreshExpiries, 5 * 60 * 1000);

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: expiries.accessExpires });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: expiries.refreshExpires });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
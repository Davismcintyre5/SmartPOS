const logger = require('../../utils/logger');

function auditLog(action) {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logger.info({
          audit: true,
          action,
          adminId: req.admin?.adminId,
          adminEmail: req.admin?.email,
          target: req.params?.id || req.body?.id || null,
          method: req.method,
          path: req.originalUrl,
          ip: req.ip,
          status: res.statusCode
        }, `AUDIT: ${action}`);
      }
    });

    next();
  };
}

module.exports = auditLog;
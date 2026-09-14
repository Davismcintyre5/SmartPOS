const helmet = require('helmet');

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

module.exports = helmetMiddleware;
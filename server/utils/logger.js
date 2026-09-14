const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'smartpos-server',
    env: process.env.NODE_ENV || 'development'
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname,service,env'
        }
      }
    : undefined
});

module.exports = logger;
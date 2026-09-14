require('./scripts/dnsSet');

const express = require('express');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/db');
const { connectRedis, disconnectRedis } = require('./config/redis');
const { startSchedulers, stopSchedulers } = require('./schedulers');

const corsMiddleware = require('./middleware/global/cors');
const helmetMiddleware = require('./middleware/global/helmet');
const { globalLimiter } = require('./middleware/global/rateLimit');
const requestLogger = require('./middleware/global/requestLogger');
const maintenance = require('./middleware/global/maintenance');
const errorHandler = require('./middleware/global/errorHandler');
const notFound = require('./middleware/global/notFound');

const routes = require('./routes');

let server;

const B = '\x1b[34m';
const C = '\x1b[36m';
const G = '\x1b[32m';
const Y = '\x1b[33m';
const R = '\x1b[31m';
const D = '\x1b[2m';
const X = '\x1b[0m';

const BANNER = `
${B}  ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗██████╗  ██████╗ ███████╗${X}
${B}  ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔═══██╗██╔════╝${X}
${B}  ███████╗██╔████╔██║███████║██████╔╝   ██║   ██████╔╝██║   ██║███████╗${X}
${B}  ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║   ██╔═══╝ ██║   ██║╚════██║${X}
${B}  ███████║██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   ██║     ╚██████╔╝███████║${X}
${B}  ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝${X}
`;

function printBanner() {
  console.log(BANNER);
  console.log(`${C}  SmartPOS API Server${X}`);
  console.log(`${D}  Owner: Davis Okoth · Company: HDM${X}`);
  console.log(`${D}  ─────────────────────────────────────────${X}`);
  console.log(`  Environment : ${Y}${env.NODE_ENV}${X}`);
  console.log(`  Port        : ${Y}${env.PORT}${X}`);
  console.log(`  Started     : ${D}${new Date().toISOString()}${X}`);
  console.log(`${D}  ─────────────────────────────────────────${X}`);
  console.log('');
}

function printShutdown() {
  console.log('');
  console.log(`${D}  ─────────────────────────────────────────${X}`);
  console.log(`${C}  SmartPOS API Server${X} ${D}— shutting down${X}`);
  console.log(`${D}  ─────────────────────────────────────────${X}`);
}

function buildApp() {
  const app = express();

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(globalLimiter);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(maintenance);

  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'SmartPOS API',
      data: {
        name: 'SmartPOS',
        company: 'HDM',
        version: '1.0.0',
        env: env.NODE_ENV
      }
    });
  });

  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'SmartPOS API v1',
      data: {
        version: 'v1',
        baseUrl: '/api/v1'
      }
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'OK',
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  });

  app.use('/api/v1', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

async function start() {
  try {
    printBanner();

    await connectDB();
    console.log(`${G}  ✓${X} MongoDB connected`);

    await connectRedis();
    if (env.REDIS_ENABLED) {
      console.log(`${G}  ✓${X} Redis connected`);
    } else {
      console.log(`${D}  ○ Redis disabled${X}`);
    }

    startSchedulers();
    console.log(`${G}  ✓${X} Schedulers started`);

    const app = buildApp();

    server = app.listen(env.PORT, () => {
      console.log(`${G}  ✓${X} Server listening on ${C}http://localhost:${env.PORT}${X}`);
      console.log('');
    });

    registerShutdownHandlers();
  } catch (err) {
    console.log(`${R}  ✗ Failed to start server${X}`);
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

function registerShutdownHandlers() {
  let shuttingDown = false;

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    printShutdown();
    console.log(`${Y}  →${X} Received ${signal}`);

    try {
      stopSchedulers();
      console.log(`${G}  ✓${X} Schedulers stopped`);

      if (server) {
        await new Promise((resolve) => server.close(resolve));
        console.log(`${G}  ✓${X} HTTP server closed`);
      }

      await disconnectRedis();
      if (env.REDIS_ENABLED) {
        console.log(`${G}  ✓${X} Redis disconnected`);
      }

      await disconnectDB();
      console.log(`${G}  ✓${X} MongoDB disconnected`);

      console.log(`${G}  ✓${X} Shutdown complete`);
      console.log('');
      process.exit(0);
    } catch (err) {
      console.log(`${R}  ✗ Error during shutdown${X}`);
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    process.exit(1);
  });
}

start();
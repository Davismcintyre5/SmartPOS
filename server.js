require('dotenv/config');
const path = require('path');
const fs = require('fs');
const express = require('express');

const pkg = require('./package.json');
const { env } = require('./config/env');
const { connectDB, disconnectDB, mongoose } = require('./config/db');
const { connectRedis, disconnectRedis, getRedis } = require('./config/redis');
const { startKeepAlive, stopKeepAlive } = require('./config/keepAlive');
const { logger } = require('./utils/logger');

const { requestId } = require('./middleware/global/requestId');
const { requestLogger } = require('./middleware/global/requestLogger');
const { helmetMw } = require('./middleware/global/helmet');
const { corsMw } = require('./middleware/global/cors');
const { bodyParser } = require('./middleware/global/bodyParser');
const { rateLimitMw } = require('./middleware/global/rateLimit');
const { sanitize } = require('./middleware/global/sanitize');
const { notFound } = require('./middleware/global/notFound');
const { errorHandler } = require('./middleware/global/errorHandler');

const routes = require('./routes');
const { startSchedulers } = require('./schedulers');

const CLIENT_DIST = path.join(__dirname, 'client', 'dist');

const BOT_PROBE_PREFIXES = [
  '/.env',
  '/.git',
  '/.gitignore',
  '/.htaccess',
  '/.ds_store',
  '/.vscode',
  '/.idea',
  '/.aws',
  '/.ssh',
  '/info.php',
  '/phpinfo.php',
  '/wp-admin',
  '/wp-login.php',
  '/wp-content',
  '/wp-includes',
  '/wp-json',
  '/xmlrpc.php',
  '/administrator',
  '/actuator',
  '/telescope',
  '/graphql',
  '/graphiql',
  '/v2/_catalog',
  '/server-status',
  '/server-info',
  '/trace.axd',
  '/elmah.axd',
  '/debug/default',
  '/ecp/current',
  '/@vite',
  '/_profiler',
  '/___proxy_subdomain_whm',
  '/___proxy_subdomain_cpanel',
  '/config.json',
  '/config.yml',
  '/config.yaml',
  '/backup.zip',
  '/backup.sql',
  '/database.sql',
  '/dump.sql',
  '/cgi-bin',
  '/shell.php',
  '/phpmyadmin',
  '/pma',
  '/admin.php',
  '/adminer.php',
  '/manager/html',
  '/solr',
  '/elasticsearch',
  '/_cluster/health',
  '/_cat/indices',
  '/jenkins',
  '/nexus',
  '/management',
  '/swagger-ui.html',
  '/swagger-resources',
  '/openapi.json',
  '/api-docs',
  '/v3/api-docs',
].map((p) => p.toLowerCase());

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function stripAnsi(str) {
  return String(str).replace(/\x1b\[[0-9;]*m/g, '');
}

function banner(lines) {
  const width = Math.max(...lines.map((l) => stripAnsi(l).length)) + 4;
  const top = `╭${'─'.repeat(width)}╮`;
  const bottom = `╰${'─'.repeat(width)}╯`;
  const body = lines
    .map((l) => `│  ${l}${' '.repeat(width - stripAnsi(l).length - 2)}│`)
    .join('\n');
  return `\n${top}\n${body}\n${bottom}\n`;
}

function inspectClientDist() {
  const indexPath = path.join(CLIENT_DIST, 'index.html');
  const exists = fs.existsSync(indexPath);
  let assetCount = 0;
  if (exists) {
    try {
      const assetsDir = path.join(CLIENT_DIST, 'assets');
      if (fs.existsSync(assetsDir)) {
        assetCount = fs.readdirSync(assetsDir).length;
      }
    } catch {
      // ignore
    }
  }
  return { exists, indexPath, assetCount };
}

function stripTrailingSlash(url) {
  return (url || '').replace(/\/+$/, '');
}

async function bootstrap() {
  const clientInfo = inspectClientDist();
  const appUrl = stripTrailingSlash(env.appUrl);
  const adminUrl = stripTrailingSlash(env.adminUrl);
  const apiUrl = stripTrailingSlash(env.apiBaseUrl);
  const fallbackUrl = `http://localhost:${env.port}`;

  process.stdout.write(
    banner([
      `${C.bold}${C.cyan}SmartPOS API${C.reset}`,
      `${C.dim}version:${C.reset} ${pkg.version}`,
      `${C.dim}env:${C.reset}     ${env.nodeEnv}`,
      `${C.dim}port:${C.reset}    ${env.port}`,
      `${C.dim}url:${C.reset}     ${appUrl || fallbackUrl}`,
      `${C.dim}admin:${C.reset}   ${adminUrl || '(not set)'}`,
      clientInfo.exists
        ? `${C.dim}client:${C.reset}  ${C.green}✔ dist/ found${C.reset} (${clientInfo.assetCount} assets)`
        : `${C.dim}client:${C.reset}  ${C.red}✘ dist/ missing${C.reset} — API-only mode`,
    ])
  );

  if (!clientInfo.exists && env.isProd) {
    logger.error(
      { expected: clientInfo.indexPath },
      'client/dist/index.html is missing in production — build the client before starting'
    );
    process.exit(1);
  }

  try {
    await connectDB();
  } catch (e) {
    logger.error({ err: e.message }, 'boot failed: mongodb');
    process.exit(1);
  }

  try {
    const redis = await connectRedis();
    if (!redis) logger.warn('boot: redis disabled');
  } catch (e) {
    logger.warn({ err: e.message }, 'boot: redis failed — continuing');
  }

  const app = express();

  app.set('trust proxy', 1);

  app.use(requestId);
  app.use(requestLogger);
  app.use(helmetMw);
  app.use(corsMw);

  app.use(
    '/api/public/webhooks/stripe',
    express.raw({ type: 'application/json' })
  );

  app.use(bodyParser);
  app.use(sanitize);
  app.use(rateLimitMw);

  app.get('/__meta', (_req, res) => {
    res.json({
      ok: true,
      service: 'smartpos-api',
      version: pkg.version,
      message: 'SmartPOS API — running',
      urls: {
        app: appUrl || null,
        admin: adminUrl || null,
        api: apiUrl || null,
      },
    });
  });

  app.get('/health', (_req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    const redisClient = getRedis();
    const redisUp = redisClient ? redisClient.status === 'ready' : false;

    res.json({
      ok: true,
      status: dbUp ? 'healthy' : 'degraded',
      version: pkg.version,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      urls: {
        app: appUrl || null,
        admin: adminUrl || null,
        api: apiUrl || null,
      },
      dependencies: {
        mongodb: dbUp ? 'up' : 'down',
        redis: redisUp ? 'up' : env.redis.enabled ? 'down' : 'disabled',
      },
      client: {
        built: clientInfo.exists,
        assets: clientInfo.assetCount,
      },
    });
  });

  app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    const hit = BOT_PROBE_PREFIXES.some(
      (probe) =>
        p === probe || p.startsWith(probe + '/') || p.startsWith(probe + '.')
    );
    if (hit) {
      logger.debug(
        { path: req.path, ip: req.ip, ua: req.headers['user-agent'] },
        'bot probe blocked'
      );
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Not found' },
      });
    }
    next();
  });

  app.use('/api', routes);

  if (clientInfo.exists) {
    app.use(
      express.static(CLIENT_DIST, {
        index: false,
        maxAge: '1y',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(clientInfo.indexPath, (err) => {
        if (err) next();
      });
    });
  } else {
    app.get('/', (_req, res) => {
      res.json({
        ok: true,
        service: 'smartpos-api',
        version: pkg.version,
        message: 'SmartPOS API — running (client not built)',
        hint: 'cd client && npm run build',
      });
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  const server = app.listen(env.port, () => {
    const healthUrl = `${apiUrl || appUrl || fallbackUrl}/health`;

    logger.info(
      `\n${C.green}${C.bold}✔ Ready${C.reset}\n` +
        `   ${C.dim}version:${C.reset}  ${pkg.version}\n` +
        `   ${C.dim}url:${C.reset}      ${C.cyan}${appUrl || fallbackUrl}${C.reset}\n` +
        `   ${C.dim}admin:${C.reset}    ${C.cyan}${adminUrl || '(not set)'}${C.reset}\n` +
        `   ${C.dim}health:${C.reset}   ${C.cyan}${healthUrl}${C.reset}\n` +
        `   ${C.dim}api:${C.reset}      ${C.cyan}${(apiUrl || appUrl || fallbackUrl)}/api${C.reset}\n`
    );

    if (clientInfo.exists) {
      logger.info(
        `   ${C.dim}client:${C.reset}   ${C.cyan}${appUrl || apiUrl || fallbackUrl}/${C.reset}`
      );
    } else {
      logger.warn(
        `   ${C.yellow}client:${C.reset}   ${C.yellow}not built${C.reset} — run ${C.cyan}cd client && npm run build${C.reset}`
      );
    }

    if (env.keepAlive.enabled) {
      try {
        startKeepAlive();
      } catch (e) {
        logger.error({ err: e.message }, 'keepAlive failed to start');
      }
    }
  });

  if (!env.disableSchedulers) {
    try {
      startSchedulers();
    } catch (e) {
      logger.error({ err: e.message }, 'schedulers failed to start');
    }
  }

  const shutdown = async (signal) => {
    logger.warn(`shutdown: ${signal}`);
    try {
      stopKeepAlive();
    } catch {
      // ignore
    }
    server.close(async () => {
      try {
        await disconnectRedis();
        await disconnectDB();
        logger.info('shutdown complete');
        process.exit(0);
      } catch (e) {
        logger.error({ err: e.message }, 'shutdown error');
        process.exit(1);
      }
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason: String(reason) }, 'unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error({ err: err.message, stack: err.stack }, 'uncaughtException');
    process.exit(1);
  });
}

bootstrap();
// server/keepAlive.js
/**
 * SmartPOS - Self-Ping Keep Alive
 * Prevents Render free tier sleep by pinging health endpoint every 9 minutes
 */

const https = require('https');
const http = require('http');

const SELF_URL = process.env.RENDER_EXTERNAL_URL || 'https://smartpos-server-api.onrender.com';
const PING_INTERVAL = 9 * 60 * 1000; // 9 minutes (Render sleeps after 15)
const INITIAL_DELAY = 60 * 1000; // 60 seconds wait for server to fully start

let keepAliveInterval = null;

/**
 * Ping self health endpoint
 */
function pingSelf() {
  const url = `${SELF_URL}/health`;
  const protocol = url.startsWith('https') ? https : http;
  
  const request = protocol.get(url, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      if (response.statusCode === 200) {
        console.log(`[Keep-Alive] ✓ Health check OK - ${new Date().toISOString()}`);
      } else {
        console.warn(`[Keep-Alive] ⚠ Health check returned ${response.statusCode} - ${new Date().toISOString()}`);
      }
    });
  });
  
  request.on('error', (err) => {
    console.warn(`[Keep-Alive] ✗ Ping failed: ${err.message}`);
  });
  
  request.setTimeout(10000, () => {
    request.destroy();
    console.warn('[Keep-Alive] ✗ Request timeout');
  });
}

/**
 * Start keep-alive pings
 */
function startKeepAlive() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Keep-Alive] ⊘ Disabled (development mode)');
    return;
  }
  
  console.log(`[Keep-Alive] ✓ Starting - will ping ${SELF_URL}/health every ${PING_INTERVAL / 1000}s`);
  
  // Wait for server to fully start before first ping
  setTimeout(() => {
    console.log('[Keep-Alive] First ping in 5s...');
    pingSelf();
    
    // Set interval for subsequent pings
    keepAliveInterval = setInterval(pingSelf, PING_INTERVAL);
  }, INITIAL_DELAY);
}

/**
 * Stop keep-alive pings (for graceful shutdown)
 */
function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('[Keep-Alive] ⊘ Stopped');
  }
}

module.exports = {
  startKeepAlive,
  stopKeepAlive,
};
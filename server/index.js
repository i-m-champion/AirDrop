import http from 'http';
import net from 'net';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { getNetworkInfo } from './network.js';
import { createRouter } from './routes.js';
import { setupWebSocket } from './websocket.js';
import { printStartupBanner } from './banner.js';

// Parse CLI arg or ENV or default
const cliPort = process.argv[2] ? parseInt(process.argv[2], 10) : null;
const DEFAULT_PORT = parseInt(process.env.PORT || cliPort || '3000', 10);
const HOST = '0.0.0.0';

/**
 * Test if a port is currently available on the given host
 */
function isPortAvailable(port, host = '0.0.0.0') {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        resolve(false);
      })
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, host);
  });
}

/**
 * Scan for an available port starting from preferredPort
 */
async function findAvailablePort(startPort, host = '0.0.0.0', maxAttempts = 30) {
  let port = startPort;
  for (let i = 0; i < maxAttempts; i++) {
    const free = await isPortAvailable(port, host);
    if (free) return port;
    port++;
  }
  return startPort; // Fallback
}

async function startServer() {
  const actualPort = await findAvailablePort(DEFAULT_PORT, HOST);

  if (actualPort !== DEFAULT_PORT) {
    console.log(`\n⚠️  Notice: Port ${DEFAULT_PORT} is currently occupied by another application.`);
    console.log(`⚡ Automatically switching to open port: \x1b[33m\x1b[1m${actualPort}\x1b[0m\n`);
  }

  const app = express();
  const server = http.createServer(app);

  // Enable cross-origin resource sharing for local LAN clients
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Setup WebSocket server & obtain broadcast helper
  const { broadcast } = setupWebSocket(server);

  // Store port on app for route access
  app.set('port', actualPort);

  // Mount API routes
  app.use('/api', createRouter(broadcast));

  // Serve production frontend assets if built
  const DIST_DIR = path.resolve(process.cwd(), 'dist');

  if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  } else {
    // Graceful development fallback if dist is not yet built
    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AirDrop Local - Building...</title>
            <style>
              body { font-family: sans-serif; background: #FFE600; color: #000; padding: 40px; }
              .box { border: 3px solid #000; box-shadow: 6px 6px 0px #000; padding: 24px; background: #fff; max-width: 600px; margin: auto; }
              h1 { margin-top: 0; }
              code { background: #eee; padding: 2px 6px; border: 1px solid #000; }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>⚡ AirDrop Local Server is Running</h1>
              <p>API is active on port ${actualPort}. The frontend build directory (<code>dist/</code>) has not been compiled yet.</p>
              <p>Run <code>npm run build</code> or <code>npm run dev</code> to launch the Neo-Brutalist Kinetic UI!</p>
            </div>
          </body>
        </html>
      `);
    });
  }

  server.listen(actualPort, HOST, () => {
    const netInfo = getNetworkInfo(actualPort);
    printStartupBanner(netInfo);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

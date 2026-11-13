import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { getNetworkInfo } from './network.js';
import { createRouter } from './routes.js';
import { setupWebSocket } from './websocket.js';
import { printStartupBanner } from './banner.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

const app = express();
const server = http.createServer(app);

// Enable cross-origin resource sharing for local LAN clients
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup WebSocket server & obtain broadcast helper
const { broadcast } = setupWebSocket(server);

// Store port on app for route access
app.set('port', PORT);

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
            <p>API is active on port ${PORT}. The frontend build directory (<code>dist/</code>) has not been compiled yet.</p>
            <p>Run <code>npm run build</code> or <code>npm run dev</code> to launch the Neo-Brutalist Kinetic UI!</p>
          </div>
        </body>
      </html>
    `);
  });
}

// Start server on all network interfaces
server.listen(PORT, HOST, () => {
  const netInfo = getNetworkInfo(PORT);
  printStartupBanner(netInfo);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

import { WebSocketServer, WebSocket } from 'ws';
import { parseDevice } from './device.js';
import { getAllFiles } from './storage.js';
import { getAllBeams } from './beam.js';

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });
  const clients = new Map(); // ws -> clientInfo

  function broadcast(data, excludeWs = null) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    for (const [client] of clients.entries()) {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch (err) {
          console.error('Error broadcasting to client:', err);
        }
      }
    }
  }

  function getPeersList() {
    const peers = [];
    for (const [, info] of clients.entries()) {
      peers.push({
        id: info.id,
        device: info.device,
        connectedAt: info.connectedAt,
      });
    }
    return peers;
  }

  wss.on('connection', (ws, req) => {
    const clientId = `peer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const device = parseDevice(req.headers['user-agent'], req.socket.remoteAddress);
    const clientInfo = {
      id: clientId,
      device,
      connectedAt: new Date().toISOString(),
      isAlive: true,
    };

    clients.set(ws, clientInfo);

    // Send initial handshake state to the newly connected peer
    ws.send(JSON.stringify({
      type: 'INIT_STATE',
      yourPeerId: clientId,
      yourDevice: device,
      peersCount: clients.size,
      peers: getPeersList(),
      files: getAllFiles(),
      beams: getAllBeams(),
    }));

    // Broadcast to other peers that a new device arrived
    broadcast({
      type: 'PEER_JOINED',
      peer: {
        id: clientId,
        device,
      },
      peersCount: clients.size,
      peers: getPeersList(),
    }, ws);

    // Listen for incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG' }));
          return;
        }

        // Pass-through broadcasts (e.g. typing indicator, custom peer signal)
        if (data.type === 'PEER_ACTION') {
          broadcast({
            ...data,
            from: clientId,
            sender: device,
          }, ws);
        }
      } catch (err) {
        console.error('Malformed WebSocket payload:', err);
      }
    });

    ws.on('pong', () => {
      clientInfo.isAlive = true;
    });

    ws.on('close', () => {
      clients.delete(ws);
      broadcast({
        type: 'PEER_LEFT',
        peerId: clientId,
        device,
        peersCount: clients.size,
        peers: getPeersList(),
      });
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for client ${clientId}:`, err.message);
      clients.delete(ws);
    });
  });

  // Keep-alive heartbeat every 25 seconds
  const interval = setInterval(() => {
    for (const [ws, info] of clients.entries()) {
      if (!info.isAlive) {
        clients.delete(ws);
        ws.terminate();
        continue;
      }
      info.isAlive = false;
      try {
        ws.ping();
      } catch {
        clients.delete(ws);
      }
    }
  }, 25000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return {
    wss,
    broadcast,
    getClientsCount: () => clients.size,
    getPeersList,
  };
}

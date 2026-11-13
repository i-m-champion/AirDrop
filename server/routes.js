import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import QRCode from 'qrcode';
import archiver from 'archiver';
import mime from 'mime-types';
import { getNetworkInfo } from './network.js';
import { uploadMiddleware } from './upload.js';
import { parseDevice } from './device.js';
import {
  UPLOADS_DIR,
  getAllFiles,
  addFileToRegistry,
  removeFile,
  clearAllFiles,
  getFileById,
  getFileByName,
} from './storage.js';
import {
  getAllBeams,
  addBeam,
  removeBeam,
  clearAllBeams,
} from './beam.js';

export function createRouter(broadcast) {
  const router = express.Router();

  // 1. System & Network Telemetry
  router.get('/info', (req, res) => {
    const port = req.app.get('port') || 3000;
    const netInfo = getNetworkInfo(port);
    const files = getAllFiles();
    const beams = getAllBeams();

    res.json({
      ...netInfo,
      stats: {
        totalFiles: files.length,
        totalBytes: files.reduce((acc, f) => acc + (f.size || 0), 0),
        totalBeams: beams.length,
        uploadsDir: UPLOADS_DIR,
      },
    });
  });

  // 2. Dynamic QR Code Generator (SVG or Data URL)
  router.get('/qr', async (req, res) => {
    try {
      const port = req.app.get('port') || 3000;
      const netInfo = getNetworkInfo(port);
      const targetUrl = req.query.url || netInfo.primaryUrl;

      const dataUrl = await QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: {
          dark: '#000000',
          light: '#FFE600', // Neo-Brutalist Electric Yellow background!
        },
      });

      res.json({
        url: targetUrl,
        dataUrl,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate QR code', details: err.message });
    }
  });

  // 3. List Files
  router.get('/files', (req, res) => {
    res.json(getAllFiles());
  });

  // 4. Multi-File Upload
  router.post('/upload', uploadMiddleware.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided for upload' });
    }

    const device = parseDevice(req.headers['user-agent'], req.ip);
    const addedFiles = [];

    for (const file of req.files) {
      const mimeType = mime.lookup(file.filename) || file.mimetype || 'application/octet-stream';
      const fileMeta = {
        id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        filename: file.filename,
        originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        size: file.size,
        mimeType,
        uploadedAt: new Date().toISOString(),
        sender: device.os,
        senderIp: device.ip,
        isLocal: req.ip === '127.0.0.1' || req.ip === '::1',
      };

      addFileToRegistry(fileMeta);
      addedFiles.push(fileMeta);
    }

    // Broadcast newly uploaded files to all WebSocket clients
    if (broadcast) {
      broadcast({
        type: 'FILES_ADDED',
        files: addedFiles,
        sender: device,
      });
    }

    res.json({
      success: true,
      count: addedFiles.length,
      files: addedFiles,
    });
  });

  // 5. File Download (Forced download attachment)
  router.get('/download/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const fullPath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(fullPath, filename);
  });

  // 6. Media Preview & Stream (Supports HTTP 206 Partial Content for video/audio seeking)
  router.get('/preview/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const fullPath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const mimeType = mime.lookup(filename) || 'application/octet-stream';

    if (range) {
      // Parse Range header e.g. "bytes=32324-"
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(fullPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Content-Disposition': 'inline',
      });
      fs.createReadStream(fullPath).pipe(res);
    }
  });

  // 7. Delete File
  router.delete('/files/:id', (req, res) => {
    const removed = removeFile(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'File not found or already deleted' });
    }

    if (broadcast) {
      broadcast({
        type: 'FILE_REMOVED',
        id: req.params.id,
        filename: removed.filename,
      });
    }

    res.json({ success: true, removed });
  });

  // 8. Delete All Files
  router.delete('/files', (req, res) => {
    const count = clearAllFiles();
    if (broadcast) {
      broadcast({
        type: 'ALL_FILES_CLEARED',
        count,
      });
    }
    res.json({ success: true, count });
  });

  // 9. Batch Download All Files as Zip Archive
  router.get('/download-all', (req, res) => {
    const files = getAllFiles();
    if (files.length === 0) {
      return res.status(400).json({ error: 'No files to download' });
    }

    const archive = archiver('zip', { zlib: { level: 5 } });
    const zipName = `AirDrop_Bundle_${new Date().toISOString().slice(0, 10)}.zip`;

    res.attachment(zipName);
    archive.pipe(res);

    for (const file of files) {
      const fullPath = path.join(UPLOADS_DIR, file.filename);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: file.filename });
      }
    }

    archive.finalize();
  });

  // 10. Open Uploads Folder in macOS Finder
  router.post('/open-folder', (req, res) => {
    if (process.platform === 'darwin') {
      exec(`open "${UPLOADS_DIR}"`, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to open folder in Finder', details: err.message });
        }
        res.json({ success: true, path: UPLOADS_DIR });
      });
    } else if (process.platform === 'win32') {
      exec(`explorer "${UPLOADS_DIR}"`, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to open Explorer' });
        res.json({ success: true, path: UPLOADS_DIR });
      });
    } else {
      // Linux
      exec(`xdg-open "${UPLOADS_DIR}"`, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to open file manager' });
        res.json({ success: true, path: UPLOADS_DIR });
      });
    }
  });

  // 11. Text / Link Beam Endpoints
  router.get('/beam', (req, res) => {
    res.json(getAllBeams());
  });

  router.post('/beam', (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text content cannot be empty' });
    }

    const device = parseDevice(req.headers['user-agent'], req.ip);
    const beam = addBeam({
      text,
      sender: device.os,
      ip: device.ip,
    });

    if (broadcast) {
      broadcast({
        type: 'BEAM_RECEIVED',
        beam,
        sender: device,
      });
    }

    res.json({ success: true, beam });
  });

  router.delete('/beam/:id', (req, res) => {
    const removed = removeBeam(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Beam note not found' });
    }

    if (broadcast) {
      broadcast({
        type: 'BEAM_REMOVED',
        id: req.params.id,
      });
    }

    res.json({ success: true, removed });
  });

  router.delete('/beam', (req, res) => {
    const count = clearAllBeams();
    if (broadcast) {
      broadcast({
        type: 'ALL_BEAMS_CLEARED',
        count,
      });
    }
    res.json({ success: true, count });
  });

  return router;
}

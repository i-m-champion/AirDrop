import multer from 'multer';
import path from 'path';
import mime from 'mime-types';
import { UPLOADS_DIR, getUniqueFilename } from './storage.js';

// Multer disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Decode original name properly if encoded in utf-8 or latin1
    let decodedName = file.originalname;
    try {
      decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch {
      decodedName = file.originalname;
    }
    const safeName = getUniqueFilename(UPLOADS_DIR, decodedName);
    cb(null, safeName);
  },
});

// Configure upload middleware with no arbitrary file size cap (LAN transfers can be gigabytes)
export const uploadMiddleware = multer({
  storage,
  limits: {
    // 50GB max per file for high-speed local LAN transfers
    fileSize: 50 * 1024 * 1024 * 1024,
    files: 100, // up to 100 files at once
  },
});

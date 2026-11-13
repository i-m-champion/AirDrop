import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory file registry synced with disk
let fileRegistry = [];

/**
 * Sanitize filename to prevent directory traversal and illegal characters
 */
export function sanitizeFilename(filename) {
  // Strip null bytes, paths, and control characters
  let clean = path.basename(filename).replace(/[\/\\?%*:|"<>]/g, '_');
  // Trim whitespace and dots
  clean = clean.trim().replace(/^\.+/, '');
  if (!clean) clean = `file_${Date.now()}`;
  return clean;
}

/**
 * Generate a unique filename if collision occurs
 */
export function getUniqueFilename(targetDir, originalName) {
  const safeName = sanitizeFilename(originalName);
  const ext = path.extname(safeName);
  const base = path.basename(safeName, ext);

  let candidate = safeName;
  let counter = 1;

  while (fs.existsSync(path.join(targetDir, candidate))) {
    candidate = `${base} (${counter})${ext}`;
    counter++;
  }

  return candidate;
}

/**
 * Initialize or refresh registry from disk
 */
export function syncRegistryFromDisk() {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const validFiles = files.filter(f => f !== '.gitkeep' && !f.startsWith('.'));

    fileRegistry = validFiles.map(filename => {
      const fullPath = path.join(UPLOADS_DIR, filename);
      const stat = fs.statSync(fullPath);
      const mimeType = mime.lookup(filename) || 'application/octet-stream';

      return {
        id: `file_${stat.ino || filename}_${stat.mtimeMs}`,
        filename,
        originalName: filename,
        size: stat.size,
        mimeType,
        uploadedAt: stat.mtime.toISOString(),
        sender: 'Local / Mac',
        isLocal: true,
      };
    }).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  } catch (err) {
    console.error('Failed to sync uploads from disk:', err);
  }
}

// Initial sync on startup
syncRegistryFromDisk();

export function getAllFiles() {
  return fileRegistry;
}

export function addFileToRegistry(fileMeta) {
  fileRegistry.unshift(fileMeta);
  return fileMeta;
}

export function getFileById(id) {
  return fileRegistry.find(f => f.id === id);
}

export function getFileByName(filename) {
  return fileRegistry.find(f => f.filename === filename);
}

export function removeFile(id) {
  const index = fileRegistry.findIndex(f => f.id === id);
  if (index === -1) return null;

  const [removed] = fileRegistry.splice(index, 1);
  const fullPath = path.join(UPLOADS_DIR, removed.filename);

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error(`Failed to delete ${fullPath}:`, err);
    }
  }

  return removed;
}

export function clearAllFiles() {
  const removedCount = fileRegistry.length;
  for (const item of fileRegistry) {
    const fullPath = path.join(UPLOADS_DIR, item.filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error(`Failed to delete ${fullPath}:`, err);
      }
    }
  }
  fileRegistry = [];
  return removedCount;
}

/**
 * Format bytes into human-readable unit
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format ISO timestamp into clean relative or local time
 */
export function formatTime(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

/**
 * Check if file is an image
 */
export function isImage(mimeType = '', filename = '') {
  return (
    mimeType.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(filename)
  );
}

/**
 * Check if file is a video
 */
export function isVideo(mimeType = '', filename = '') {
  return (
    mimeType.startsWith('video/') ||
    /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(filename)
  );
}

/**
 * Check if file is audio
 */
export function isAudio(mimeType = '', filename = '') {
  return (
    mimeType.startsWith('audio/') ||
    /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(filename)
  );
}

/**
 * Check if file is a PDF
 */
export function isPdf(mimeType = '', filename = '') {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(filename);
}

/**
 * Check if file is plain text / code
 */
export function isTextOrCode(mimeType = '', filename = '') {
  return (
    mimeType.startsWith('text/') ||
    /\.(txt|md|json|js|jsx|ts|tsx|html|css|py|sh|yaml|yml|xml|csv)$/i.test(filename)
  );
}

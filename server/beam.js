// In-memory text / clipboard beam history
let beamHistory = [];

export function isUrl(text) {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getAllBeams() {
  return beamHistory;
}

export function addBeam({ text, sender = 'Unknown Device', ip = '' }) {
  if (!text || typeof text !== 'string') return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  const beamItem = {
    id: `beam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: trimmed,
    isUrl: isUrl(trimmed),
    createdAt: new Date().toISOString(),
    sender,
    ip,
  };

  // Keep latest 100 items
  beamHistory.unshift(beamItem);
  if (beamHistory.length > 100) {
    beamHistory = beamHistory.slice(0, 100);
  }

  return beamItem;
}

export function removeBeam(id) {
  const index = beamHistory.findIndex(b => b.id === id);
  if (index === -1) return null;
  return beamHistory.splice(index, 1)[0];
}

export function clearAllBeams() {
  const count = beamHistory.length;
  beamHistory = [];
  return count;
}

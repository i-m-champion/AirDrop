import { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/sound.js';

export function useAirDropSocket() {
  const [connected, setConnected] = useState(false);
  const [peersCount, setPeersCount] = useState(1);
  const [peers, setPeers] = useState([]);
  const [yourPeerId, setYourPeerId] = useState('');
  const [yourDevice, setYourDevice] = useState(null);
  const [files, setFiles] = useState([]);
  const [beams, setBeams] = useState([]);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [toasts, setToasts] = useState([]);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Toast notification helper
  const addToast = useCallback((toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newToast = { id, ...toast, timestamp: Date.now() };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch host system and network info
  const fetchInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/info');
      if (res.ok) {
        const data = await res.json();
        setNetworkInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch network telemetry:', err);
    }
  }, []);

  // Fetch file list
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  }, []);

  // Fetch clipboard beams
  const fetchBeams = useCallback(async () => {
    try {
      const res = await fetch('/api/beam');
      if (res.ok) {
        const data = await res.json();
        setBeams(data);
      }
    } catch (err) {
      console.error('Failed to fetch text beams:', err);
    }
  }, []);

  // Initialize and maintain WebSocket connection
  const connectSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'INIT_STATE':
            setYourPeerId(data.yourPeerId);
            setYourDevice(data.yourDevice);
            setPeersCount(data.peersCount || 1);
            setPeers(data.peers || []);
            setFiles(data.files || []);
            setBeams(data.beams || []);
            break;

          case 'PEER_JOINED':
            setPeersCount(data.peersCount);
            setPeers(data.peers);
            sound.playClick();
            addToast({
              type: 'info',
              title: 'PEER CONNECTED',
              message: `${data.peer?.device?.os || 'Device'} (${data.peer?.device?.ip || 'LAN'}) joined the session`,
            });
            break;

          case 'PEER_LEFT':
            setPeersCount(data.peersCount);
            setPeers(data.peers);
            break;

          case 'FILES_ADDED':
            setFiles((prev) => {
              const newFileIds = new Set(data.files.map((f) => f.id));
              const filtered = prev.filter((f) => !newFileIds.has(f.id));
              return [...data.files, ...filtered];
            });
            sound.playSuccess();
            addToast({
              type: 'success',
              title: 'NEW FILE RECEIVED',
              message: `${data.files.length} file(s) shared by ${data.sender?.os || 'Peer'}`,
            });
            break;

          case 'FILE_REMOVED':
            setFiles((prev) => prev.filter((f) => f.id !== data.id));
            sound.playDelete();
            break;

          case 'ALL_FILES_CLEARED':
            setFiles([]);
            break;

          case 'BEAM_RECEIVED':
            setBeams((prev) => [data.beam, ...prev.filter((b) => b.id !== data.beam.id)]);
            sound.playBeam();
            addToast({
              type: 'beam',
              title: 'CLIPBOARD BEAM',
              message: data.beam.isUrl ? `Link beamed: ${data.beam.text}` : `Note beamed: ${data.beam.text.slice(0, 40)}...`,
            });
            break;

          case 'BEAM_REMOVED':
            setBeams((prev) => prev.filter((b) => b.id !== data.id));
            break;

          case 'ALL_BEAMS_CLEARED':
            setBeams([]);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectSocket();
      }, 2000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket connection error:', err);
      ws.close();
    };
  }, [addToast]);

  useEffect(() => {
    fetchInfo();
    fetchFiles();
    fetchBeams();
    connectSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchInfo, fetchFiles, fetchBeams, connectSocket]);

  // Upload multiple files with real-time XHR upload progress
  const uploadFiles = useCallback(async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    const totalBytes = Array.from(fileList).reduce((acc, f) => acc + f.size, 0);
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = elapsed > 0 ? e.loaded / elapsed : 0; // Bytes/sec

          setUploadProgress({
            percent,
            loaded: e.loaded,
            total: e.total,
            speed,
            count: fileList.length,
          });
        }
      };

      xhr.onload = () => {
        setUploadProgress(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            sound.playSuccess();
            addToast({
              type: 'success',
              title: 'UPLOAD COMPLETE',
              message: `Uploaded ${fileList.length} file(s) successfully!`,
            });
            fetchFiles();
            resolve(result);
          } catch (err) {
            reject(err);
          }
        } else {
          sound.playDelete();
          addToast({
            type: 'error',
            title: 'UPLOAD FAILED',
            message: `Server returned code ${xhr.status}`,
          });
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        setUploadProgress(null);
        sound.playDelete();
        addToast({
          type: 'error',
          title: 'NETWORK ERROR',
          message: 'Could not complete transfer to local server',
        });
        reject(new Error('Network error during upload'));
      };

      xhr.send(formData);
    });
  }, [addToast, fetchFiles]);

  // Beam text or URL to all peers
  const beamText = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    try {
      sound.playClick();
      const res = await fetch('/api/beam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        sound.playBeam();
        fetchBeams();
      }
    } catch (err) {
      console.error('Failed to beam text:', err);
    }
  }, [fetchBeams]);

  // Delete a single file
  const deleteFile = useCallback(async (id) => {
    try {
      sound.playDelete();
      const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  }, []);

  // Clear all files
  const clearAllFiles = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete ALL files from the server?')) return;
    try {
      sound.playDelete();
      const res = await fetch('/api/files', { method: 'DELETE' });
      if (res.ok) {
        setFiles([]);
      }
    } catch (err) {
      console.error('Failed to clear files:', err);
    }
  }, []);

  // Delete beam note
  const deleteBeam = useCallback(async (id) => {
    try {
      sound.playDelete();
      const res = await fetch(`/api/beam/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBeams((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete beam:', err);
    }
  }, []);

  // Clear all beam notes
  const clearAllBeams = useCallback(async () => {
    try {
      sound.playDelete();
      const res = await fetch('/api/beam', { method: 'DELETE' });
      if (res.ok) {
        setBeams([]);
      }
    } catch (err) {
      console.error('Failed to clear beams:', err);
    }
  }, []);

  // Open uploads folder in Mac Finder
  const openMacFolder = useCallback(async () => {
    try {
      sound.playClick();
      const res = await fetch('/api/open-folder', { method: 'POST' });
      if (res.ok) {
        addToast({
          type: 'info',
          title: 'FINDER OPENED',
          message: 'Opened uploads directory in macOS Finder',
        });
      }
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  }, [addToast]);

  return {
    connected,
    peersCount,
    peers,
    yourPeerId,
    yourDevice,
    files,
    beams,
    networkInfo,
    uploadProgress,
    toasts,
    addToast,
    removeToast,
    fetchInfo,
    fetchFiles,
    fetchBeams,
    uploadFiles,
    beamText,
    deleteFile,
    clearAllFiles,
    deleteBeam,
    clearAllBeams,
    openMacFolder,
  };
}

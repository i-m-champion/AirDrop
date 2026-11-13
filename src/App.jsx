import React, { useState, useEffect } from 'react';
import { useAirDropSocket } from './hooks/useAirDropSocket.js';
import { Header } from './components/Header.jsx';
import { MarqueeBanner } from './components/MarqueeBanner.jsx';
import { PairingCard } from './components/PairingCard.jsx';
import { BeamCard } from './components/BeamCard.jsx';
import { DropZone } from './components/DropZone.jsx';
import { UploadProgress } from './components/UploadProgress.jsx';
import { FileList } from './components/FileList.jsx';
import { PreviewModal } from './components/PreviewModal.jsx';
import { PeersModal } from './components/PeersModal.jsx';
import { ToastContainer } from './components/Toast.jsx';
import { BrutalistCursor } from './components/BrutalistCursor.jsx';

export function App() {
  const {
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
    uploadFiles,
    beamText,
    deleteFile,
    clearAllFiles,
    deleteBeam,
    clearAllBeams,
    openMacFolder,
  } = useAirDropSocket();

  const [darkMode, setDarkMode] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPeersModalOpen, setIsPeersModalOpen] = useState(false);

  // Sync dark mode class with <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-ink dark:text-white transition-colors selection:bg-pop-yellow selection:text-ink">
      {/* Desktop Kinetic Cursor */}
      <BrutalistCursor />

      {/* Main Header */}
      <Header
        connected={connected}
        peersCount={peersCount}
        peers={peers}
        onOpenPeersModal={() => setIsPeersModalOpen(true)}
        onOpenFolder={networkInfo?.platform === 'darwin' ? openMacFolder : null}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* Infinite Marquee Ticker */}
      <MarqueeBanner
        primaryIp={networkInfo?.primaryIp}
        port={networkInfo?.preferredPort}
      />

      {/* Dual Responsive Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Desktop: 5 cols / Mobile: full width) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Pairing QR Code Card */}
            <PairingCard networkInfo={networkInfo} onToast={addToast} />

            {/* Live Text / Link Beam Card */}
            <BeamCard
              beams={beams}
              onBeam={beamText}
              onDeleteBeam={deleteBeam}
              onClearBeams={clearAllBeams}
              onToast={addToast}
            />
          </div>

          {/* Right Column (Desktop: 7 cols / Mobile: full width) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Massive Dashed Dropzone */}
            <DropZone
              onUploadFiles={uploadFiles}
              uploading={!!uploadProgress}
            />

            {/* Real-time Multi-File Upload Progress Gauge */}
            {uploadProgress && (
              <UploadProgress progress={uploadProgress} />
            )}

            {/* Live File Transfer Feed */}
            <FileList
              files={files}
              onDeleteFile={deleteFile}
              onClearFiles={clearAllFiles}
              onPreviewFile={(f) => setPreviewFile(f)}
              onToast={addToast}
            />
          </div>
        </div>
      </main>

      {/* Modals & Overlays */}
      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {isPeersModalOpen && (
        <PeersModal
          peers={peers}
          yourPeerId={yourPeerId}
          onClose={() => setIsPeersModalOpen(false)}
        />
      )}

      {/* Toast Alert Feed */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Neo-Brutalist Footer */}
      <footer className="border-t-3 border-ink bg-white dark:bg-canvas-dark text-ink dark:text-white py-4 px-6 text-center font-mono text-xs shadow-brutal-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-pop-green border border-ink inline-block" />
            <span>AIRDROP LOCAL // NEO-BRUTALIST EDITION</span>
          </div>
          <div className="text-gray-500 text-[11px]">
            Direct Wi-Fi Router Transmission • Zero External Cloud • Pure P2P Speed
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;

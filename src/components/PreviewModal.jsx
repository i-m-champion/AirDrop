import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image, Video, Music, ExternalLink } from 'lucide-react';
import { formatBytes, isImage, isVideo, isAudio, isPdf, isTextOrCode } from '../utils/format.js';
import { sound } from '../utils/sound.js';

export function PreviewModal({ file, onClose }) {
  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (!file) return;

    if (isTextOrCode(file.mimeType, file.filename)) {
      setLoadingText(true);
      fetch(`/api/preview/${encodeURIComponent(file.filename)}`)
        .then((res) => res.text())
        .then((text) => {
          setTextContent(text);
          setLoadingText(false);
        })
        .catch(() => setLoadingText(false));
    }
  }, [file]);

  if (!file) return null;

  const previewUrl = `/api/preview/${encodeURIComponent(file.filename)}`;
  const downloadUrl = `/api/download/${encodeURIComponent(file.filename)}`;

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm">
      <div className="brutal-card bg-white dark:bg-canvas-dark text-ink dark:text-white max-w-4xl w-full max-h-[90vh] flex flex-col relative overflow-hidden animate-pop-pulse">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-3 border-ink p-4 bg-pop-yellow text-ink">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            <span className="font-mono font-bold text-xs bg-black text-pop-yellow px-2 py-0.5 border border-ink">
              PREVIEW
            </span>
            <h3 className="font-display font-black text-sm sm:text-base truncate">
              {file.originalName}
            </h3>
            <span className="font-mono text-xs hidden sm:inline text-gray-800">
              ({formatBytes(file.size)})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={downloadUrl}
              download={file.originalName}
              onClick={() => sound.playClick()}
              className="brutal-btn bg-pop-green text-ink px-3 py-1 text-xs font-black flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD</span>
            </a>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="brutal-btn bg-pop-coral text-white p-1 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-canvas-light dark:bg-black min-h-[300px]">
          {isImage(file.mimeType, file.filename) && (
            <img
              src={previewUrl}
              alt={file.originalName}
              className="max-h-[70vh] max-w-full object-contain border-3 border-ink shadow-brutal mx-auto"
            />
          )}

          {isVideo(file.mimeType, file.filename) && (
            <video
              src={previewUrl}
              controls
              playsInline
              className="max-h-[70vh] w-full border-3 border-ink shadow-brutal bg-black"
            />
          )}

          {isAudio(file.mimeType, file.filename) && (
            <div className="border-3 border-ink p-8 bg-pop-yellow shadow-brutal text-center w-full max-w-md">
              <Music className="w-16 h-16 mx-auto mb-4 text-ink animate-bounce" />
              <p className="font-mono font-bold text-sm mb-4 text-ink">{file.originalName}</p>
              <audio src={previewUrl} controls className="w-full" />
            </div>
          )}

          {isPdf(file.mimeType, file.filename) && (
            <iframe
              src={previewUrl}
              title={file.originalName}
              className="w-full h-[65vh] border-3 border-ink shadow-brutal"
            />
          )}

          {isTextOrCode(file.mimeType, file.filename) && (
            <div className="w-full h-full max-h-[65vh] overflow-y-auto border-3 border-ink bg-white dark:bg-gray-900 p-4 font-mono text-xs shadow-brutal select-text whitespace-pre-wrap">
              {loadingText ? 'Loading text preview...' : textContent || '(Empty file)'}
            </div>
          )}

          {!isImage(file.mimeType, file.filename) &&
            !isVideo(file.mimeType, file.filename) &&
            !isAudio(file.mimeType, file.filename) &&
            !isPdf(file.mimeType, file.filename) &&
            !isTextOrCode(file.mimeType, file.filename) && (
              <div className="text-center p-8 border-2 border-dashed border-ink max-w-sm">
                <FileText className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="font-display font-black text-lg mb-1 uppercase">Direct Preview Unavailable</p>
                <p className="font-mono text-xs text-gray-500 mb-4">
                  This file format ({file.mimeType}) can be downloaded directly to your device.
                </p>
                <a
                  href={downloadUrl}
                  download={file.originalName}
                  className="brutal-btn bg-pop-green text-ink px-4 py-2 font-black inline-flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD NOW</span>
                </a>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

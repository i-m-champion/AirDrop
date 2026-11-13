import React, { useState, useMemo } from 'react';
import {
  Download,
  Eye,
  Trash2,
  Copy,
  Check,
  Search,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  ArchiveRestore,
  ExternalLink,
} from 'lucide-react';
import { formatBytes, formatTime, isImage, isVideo, isAudio, isPdf } from '../utils/format.js';
import { sound } from '../utils/sound.js';

export function FileList({
  files,
  onDeleteFile,
  onClearFiles,
  onPreviewFile,
  onToast,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  // Category filter
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.originalName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (activeCategory === 'IMAGES') return isImage(file.mimeType, file.filename);
      if (activeCategory === 'VIDEOS') return isVideo(file.mimeType, file.filename);
      if (activeCategory === 'AUDIO') return isAudio(file.mimeType, file.filename);
      if (activeCategory === 'DOCS') return isPdf(file.mimeType, file.filename) || file.mimeType.startsWith('text/');
      if (activeCategory === 'ARCHIVES') {
        return /\.(zip|rar|7z|tar|gz)$/i.test(file.filename);
      }
      return true;
    });
  }, [files, searchTerm, activeCategory]);

  const handleCopyLink = async (file) => {
    try {
      const url = `${window.location.origin}/api/download/${encodeURIComponent(file.filename)}`;
      await navigator.clipboard.writeText(url);
      sound.playCopy();
      setCopiedId(file.id);
      if (onToast) {
        onToast({
          type: 'success',
          title: 'DOWNLOAD LINK COPIED',
          message: file.originalName,
        });
      }
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const getFileBadgeIcon = (file) => {
    if (isImage(file.mimeType, file.filename)) return <Image className="w-5 h-5 text-pop-yellow" />;
    if (isVideo(file.mimeType, file.filename)) return <Video className="w-5 h-5 text-pop-cyan" />;
    if (isAudio(file.mimeType, file.filename)) return <Music className="w-5 h-5 text-pop-green" />;
    if (isPdf(file.mimeType, file.filename)) return <FileText className="w-5 h-5 text-pop-coral" />;
    if (/\.(zip|rar|7z|tar|gz)$/i.test(file.filename)) return <Archive className="w-5 h-5 text-purple-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="brutal-card p-5 bg-white dark:bg-canvas-dark dark:text-white flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-ink pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pop-green border-2 border-ink" />
          <h2 className="font-display font-black text-lg tracking-tight uppercase">
            📦 Live Transfer Feed ({files.length})
          </h2>
        </div>

        {/* Global Batch Actions */}
        {files.length > 0 && (
          <div className="flex items-center gap-2">
            <a
              href="/api/download-all"
              onClick={() => sound.playClick()}
              className="brutal-btn bg-pop-yellow text-ink px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
            >
              <ArchiveRestore className="w-3.5 h-3.5" />
              <span>DOWNLOAD ALL (.ZIP)</span>
            </a>
            <button
              onClick={onClearFiles}
              className="brutal-btn bg-pop-coral text-white px-2.5 py-1.5 text-xs font-bold"
              title="Delete all files"
            >
              CLEAR
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="w-full border-2 border-ink pl-8 pr-3 py-1.5 font-mono text-xs bg-canvas-light dark:bg-black text-ink dark:text-white shadow-brutal-xs focus:outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full pb-1 sm:pb-0 font-mono text-[11px] font-bold">
          {['ALL', 'IMAGES', 'VIDEOS', 'AUDIO', 'DOCS', 'ARCHIVES'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setActiveCategory(cat);
              }}
              className={`px-2 py-1 border-2 border-ink uppercase transition-all shadow-brutal-xs flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-ink text-white dark:bg-pop-yellow dark:text-ink font-black'
                  : 'bg-white dark:bg-black text-ink dark:text-white hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files List Stream */}
      {filteredFiles.length === 0 ? (
        <div className="border-3 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-500 my-4">
          <File className="w-10 h-10 mx-auto mb-2 opacity-40 text-ink dark:text-white" />
          <p className="font-mono text-sm font-bold">No files found</p>
          <p className="font-mono text-xs text-gray-400 mt-1">
            Drag files above or tap Select Files to start streaming.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
          {filteredFiles.map((file) => {
            const hasThumbnail = isImage(file.mimeType, file.filename);

            return (
              <div
                key={file.id}
                className="border-3 border-ink p-3 bg-canvas-light dark:bg-black text-ink dark:text-white shadow-brutal-xs flex flex-col justify-between hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail or File Icon */}
                  <div
                    onClick={() => {
                      if (hasThumbnail || isVideo(file.mimeType, file.filename) || isAudio(file.mimeType, file.filename)) {
                        onPreviewFile(file);
                      }
                    }}
                    className={`w-14 h-14 border-2 border-ink bg-white dark:bg-gray-900 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-brutal-xs ${
                      hasThumbnail ? 'cursor-pointer hover:opacity-90' : ''
                    }`}
                  >
                    {hasThumbnail ? (
                      <img
                        src={`/api/preview/${encodeURIComponent(file.filename)}`}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      getFileBadgeIcon(file)
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-mono text-xs sm:text-sm font-bold truncate select-text"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                      <span className="font-bold text-ink dark:text-pop-yellow">
                        {formatBytes(file.size)}
                      </span>
                      <span>•</span>
                      <span>{formatTime(file.uploadedAt)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-gray-500">
                      <span>Sender:</span>
                      <span className="font-bold text-pop-coral uppercase">
                        {file.sender || 'Local'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tactile Action Buttons */}
                <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t-2 border-ink">
                  <div className="flex items-center gap-1.5">
                    {/* Preview Button */}
                    <button
                      onClick={() => onPreviewFile(file)}
                      className="brutal-btn bg-white dark:bg-canvas-dark text-ink dark:text-white px-2 py-1 text-[11px] flex items-center gap-1"
                      title="Preview file"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">VIEW</span>
                    </button>

                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyLink(file)}
                      className="brutal-btn bg-white dark:bg-canvas-dark text-ink dark:text-white px-2 py-1 text-[11px] flex items-center gap-1"
                      title="Copy download link"
                    >
                      {copiedId === file.id ? (
                        <Check className="w-3.5 h-3.5 text-pop-green" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Download Button */}
                    <a
                      href={`/api/download/${encodeURIComponent(file.filename)}`}
                      download={file.originalName}
                      onClick={() => sound.playClick()}
                      className="brutal-btn bg-pop-green text-ink px-3 py-1 text-[11px] font-black flex items-center gap-1"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>DOWNLOAD</span>
                    </a>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="brutal-btn bg-pop-coral text-white p-1 text-[11px]"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

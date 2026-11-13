import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, FolderPlus, FileCheck } from 'lucide-react';
import { sound } from '../utils/sound.js';

export function DropZone({ onUploadFiles, uploading }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
      sound.playClick();
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      sound.playClick();
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      sound.playClick();
      onUploadFiles(e.target.files);
      e.target.value = ''; // Reset for consecutive uploads
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`brutal-card p-6 sm:p-8 text-center transition-all duration-150 relative overflow-hidden ${
        isDragOver
          ? 'bg-pop-green text-ink border-4 border-ink scale-[1.01] shadow-brutal-xl'
          : 'bg-white dark:bg-canvas-dark dark:text-white'
      }`}
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
      />

      {/* Center Hero Icon */}
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 border-3 border-ink flex items-center justify-center mb-4 shadow-brutal transition-transform ${
            isDragOver ? 'bg-white rotate-6 scale-110' : 'bg-pop-yellow'
          }`}
        >
          <UploadCloud className="w-9 h-9 sm:w-11 sm:h-11 text-ink animate-bounce" />
        </div>

        <h3 className="font-display font-black text-xl sm:text-2xl tracking-tight uppercase">
          {isDragOver ? '⚡ RELEASE TO DROP FILES!' : 'DROP FILES ANYWHERE TO TRANSFER'}
        </h3>
        <p className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-md">
          Files are broadcasted instantly to every connected Mac, iPhone, Android, and PC.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {/* Choose Files Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            fileInputRef.current?.click();
          }}
          disabled={uploading}
          className="brutal-btn bg-pop-yellow text-ink px-5 py-3 text-xs sm:text-sm font-black flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          <span>SELECT FILES / PHOTOS</span>
        </button>

        {/* Take Photo / Camera Button (Super handy for phone/iPad users!) */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            cameraInputRef.current?.click();
          }}
          disabled={uploading}
          className="brutal-btn bg-pop-green text-ink px-5 py-3 text-xs sm:text-sm font-black flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>TAKE PHOTO / CAMERA</span>
        </button>
      </div>

      {/* Floating Badges */}
      <div className="mt-5 flex items-center justify-center gap-2 flex-wrap font-mono text-[11px]">
        <span className="badge-sticker bg-pop-cyan text-ink sticker-tilt-subtle">
          🚀 ZERO FILE SIZE LIMIT
        </span>
        <span className="badge-sticker bg-white dark:bg-canvas-dark text-ink dark:text-white sticker-tilt-right">
          ⚡ GIGABIT WI-FI SPEED
        </span>
      </div>
    </div>
  );
}

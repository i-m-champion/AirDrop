import React, { useState } from 'react';
import {
  Wifi,
  Users,
  FolderOpen,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';
import { sound } from '../utils/sound.js';

export function Header({
  connected,
  peersCount,
  peers,
  onOpenPeersModal,
  onOpenFolder,
  darkMode,
  onToggleDarkMode,
}) {
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  const handleToggleSound = () => {
    const newState = sound.toggleMute();
    setIsMuted(newState);
    if (!newState) {
      sound.playClick();
    }
  };

  return (
    <header className="border-b-3 border-ink bg-white dark:bg-canvas-dark dark:text-white sticky top-0 z-30 shadow-brutal transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Connection Status */}
        <div className="flex items-center gap-3">
          <div className="bg-pop-yellow text-ink border-3 border-ink px-3 py-1 font-black text-xl tracking-tight shadow-brutal-xs flex items-center gap-2 transform -rotate-1 hover:rotate-0 transition-transform">
            <Zap className="w-5 h-5 fill-ink" />
            <span>AIRDROP<span className="text-pop-coral">LOCAL</span></span>
          </div>

          <div
            className={`border-2 border-ink px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-2 shadow-brutal-xs ${
              connected ? 'bg-pop-green text-ink' : 'bg-pop-coral text-white'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full border border-ink ${
                connected ? 'bg-white animate-pulse' : 'bg-black'
              }`}
            />
            <span>{connected ? 'ONLINE // WI-FI' : 'OFFLINE // RECONNECTING'}</span>
          </div>
        </div>

        {/* Playful Neo-Brutalist Sticker Badges (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-2.5">
          <span className="badge-sticker bg-pop-cyan text-ink sticker-tilt-left">
            <Wifi className="w-3.5 h-3.5" /> LOCAL WI-FI ONLY
          </span>
          <span className="badge-sticker bg-pop-green text-ink sticker-tilt-right">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% PRIVATE
          </span>
          <span className="badge-sticker bg-pop-yellow text-ink sticker-tilt-subtle">
            <Smartphone className="w-3.5 h-3.5" /> ANDROID & iOS
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Peer Counter Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenPeersModal();
            }}
            className="brutal-btn bg-white dark:bg-canvas-dark text-ink dark:text-white px-3 py-1.5 text-xs sm:text-sm flex items-center gap-2"
            title="View connected peer devices"
          >
            <Users className="w-4 h-4 text-pop-coral" />
            <span className="font-mono font-bold">{peersCount} {peersCount === 1 ? 'PEER' : 'PEERS'}</span>
          </button>

          {/* Open in Mac Finder */}
          {onOpenFolder && (
            <button
              onClick={onOpenFolder}
              className="brutal-btn hidden sm:flex bg-white dark:bg-canvas-dark text-ink dark:text-white px-3 py-1.5 text-xs sm:text-sm items-center gap-1.5"
              title="Open uploads folder in Finder"
            >
              <FolderOpen className="w-4 h-4 text-pop-yellow fill-pop-yellow/30" />
              <span className="font-mono">FINDER</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="brutal-btn bg-pop-yellow text-ink p-2 flex items-center justify-center"
            title={isMuted ? 'Unmute Haptic Audio' : 'Mute Haptic Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleDarkMode();
            }}
            className="brutal-btn bg-white dark:bg-canvas-dark text-ink dark:text-white p-2 flex items-center justify-center"
            title="Toggle High-Contrast Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-pop-yellow" /> : <Moon className="w-4 h-4 text-ink" />}
          </button>
        </div>
      </div>
    </header>
  );
}

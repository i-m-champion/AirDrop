import React from 'react';
import { formatBytes } from '../utils/format.js';
import { Activity, Zap } from 'lucide-react';

export function UploadProgress({ progress }) {
  if (!progress) return null;

  const { percent = 0, loaded = 0, total = 0, speed = 0, count = 1 } = progress;

  return (
    <div className="brutal-card p-4 bg-pop-yellow text-ink border-3 border-ink shadow-brutal animate-pulse-subtle">
      <div className="flex items-center justify-between mb-2 font-mono text-xs font-black uppercase">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 fill-ink animate-bounce" />
          <span>UPLOADING {count} FILE{count > 1 ? 'S' : ''}...</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            {formatBytes(speed)}/s
          </span>
          <span className="font-bold text-sm bg-black text-pop-yellow px-1.5 py-0.5 border border-ink">
            {percent}%
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-white border-2 border-ink h-5 p-0.5 shadow-brutal-xs">
        <div
          className="h-full bg-pop-green border border-ink transition-all duration-150 ease-out"
          style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 font-mono text-[11px] font-bold">
        <span>{formatBytes(loaded)} transferred</span>
        <span>{formatBytes(total)} total</span>
      </div>
    </div>
  );
}

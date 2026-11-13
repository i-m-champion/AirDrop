import React from 'react';
import { X, CheckCircle2, AlertTriangle, Zap, Info } from 'lucide-react';
import { sound } from '../utils/sound.js';

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        let bgClass = 'bg-white dark:bg-canvas-dark text-ink dark:text-white';
        let Icon = Info;

        if (toast.type === 'success') {
          bgClass = 'bg-pop-green text-ink';
          Icon = CheckCircle2;
        } else if (toast.type === 'beam') {
          bgClass = 'bg-pop-yellow text-ink';
          Icon = Zap;
        } else if (toast.type === 'error') {
          bgClass = 'bg-pop-coral text-white';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`brutal-card p-3 border-3 border-ink shadow-brutal pointer-events-auto flex items-start gap-2.5 animate-pop-pulse ${bgClass}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-mono font-black text-xs uppercase tracking-wider">
                {toast.title}
              </h4>
              <p className="font-mono text-xs mt-0.5 break-words line-clamp-2">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onDismiss(toast.id);
              }}
              className="p-1 hover:opacity-70 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

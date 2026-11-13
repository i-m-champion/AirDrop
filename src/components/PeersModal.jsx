import React from 'react';
import { X, Users, Smartphone, Laptop, Monitor, Wifi, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound.js';
import { formatTime } from '../utils/format.js';

export function PeersModal({ peers, yourPeerId, onClose }) {
  const getDeviceIcon = (device) => {
    if (device?.type === 'mobile') return <Smartphone className="w-5 h-5 text-pop-coral" />;
    if (device?.os === 'Mac') return <Laptop className="w-5 h-5 text-pop-yellow" />;
    return <Monitor className="w-5 h-5 text-pop-cyan" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="brutal-card bg-white dark:bg-canvas-dark text-ink dark:text-white max-w-md w-full relative animate-pop-pulse">
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-ink p-4 bg-pop-cyan text-ink">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="font-display font-black text-lg uppercase">
              Connected Peers ({peers.length})
            </h3>
          </div>
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

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {peers.length === 0 ? (
            <div className="text-center py-6 text-gray-500 font-mono text-xs">
              Waiting for other devices to scan the QR code...
            </div>
          ) : (
            peers.map((peer) => {
              const isYou = peer.id === yourPeerId;

              return (
                <div
                  key={peer.id}
                  className={`border-2 border-ink p-3 flex items-center justify-between shadow-brutal-xs ${
                    isYou
                      ? 'bg-pop-yellow/20 border-pop-yellow dark:bg-pop-yellow/10'
                      : 'bg-canvas-light dark:bg-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-ink bg-white dark:bg-gray-800 flex items-center justify-center shadow-brutal-xs flex-shrink-0">
                      {getDeviceIcon(peer.device)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black">
                          {peer.device?.os || 'Unknown Device'}
                        </span>
                        {isYou && (
                          <span className="badge-sticker bg-pop-green text-ink text-[9px] py-0 px-1">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-gray-500 mt-0.5">
                        {peer.device?.browser} • IP: {peer.device?.ip || 'LAN'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-pop-green font-mono text-[10px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACTIVE</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-100 dark:bg-black border-t-2 border-ink text-center font-mono text-[11px] text-gray-600 dark:text-gray-300">
          🔒 All connections are encrypted over local router Wi-Fi.
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Maximize2, X, Globe, Smartphone } from 'lucide-react';
import { sound } from '../utils/sound.js';

export function PairingCard({ networkInfo, onToast }) {
  const [selectedInterface, setSelectedInterface] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const interfaces = networkInfo?.interfaces || [];
  const activeUrl = selectedInterface?.url || networkInfo?.primaryUrl || window.location.origin;

  // Fetch or regenerate QR code whenever selected URL changes
  useEffect(() => {
    if (!activeUrl) return;
    let isMounted = true;

    fetch(`/api/qr?url=${encodeURIComponent(activeUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.dataUrl) {
          setQrDataUrl(data.dataUrl);
        }
      })
      .catch((err) => console.error('Failed to load QR code:', err));

    return () => {
      isMounted = false;
    };
  }, [activeUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      sound.playCopy();
      setCopied(true);
      if (onToast) {
        onToast({
          type: 'success',
          title: 'LINK COPIED',
          message: activeUrl,
        });
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <div className="brutal-card p-5 relative overflow-hidden bg-white dark:bg-canvas-dark dark:text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-3 border-ink pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pop-yellow border-2 border-ink" />
            <h2 className="font-display font-black text-lg tracking-tight uppercase">
              📱 Instant Mobile Pairing
            </h2>
          </div>
          <span className="badge-sticker bg-pop-green text-ink">
            SCAN TO PAIR
          </span>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => {
              sound.playClick();
              setIsExpanded(true);
            }}
            className="group relative cursor-pointer border-3 border-ink p-3 bg-pop-yellow shadow-brutal transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg"
            title="Click to expand QR Code"
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="AirDrop Local Pairing QR"
                className="w-48 h-48 object-contain rendering-pixelated"
              />
            ) : (
              <div className="w-48 h-48 bg-white border-2 border-dashed border-ink flex items-center justify-center font-mono text-xs">
                Generating QR...
              </div>
            )}
            <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="bg-white border-2 border-ink px-2 py-1 font-mono text-xs font-bold text-ink shadow-brutal-xs flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5" /> EXPAND
              </span>
            </div>
          </div>

          {/* Wi-Fi IP / URL Display */}
          <div className="w-full mt-4 bg-canvas-light dark:bg-black border-2 border-ink p-2.5 font-mono text-xs shadow-brutal-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Globe className="w-3.5 h-3.5 flex-shrink-0 text-pop-coral" />
                <span className="font-bold truncate text-ink dark:text-pop-yellow select-all">
                  {activeUrl}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="brutal-btn bg-white dark:bg-canvas-dark text-ink dark:text-white px-2 py-1 text-xs flex items-center gap-1 flex-shrink-0"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-pop-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Interface Switcher (If multiple IPs detected) */}
          {interfaces.length > 1 && (
            <div className="w-full mt-3">
              <label className="block font-mono text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                Select Network Interface:
              </label>
              <select
                value={selectedInterface?.address || networkInfo?.primaryIp}
                onChange={(e) => {
                  const iface = interfaces.find((i) => i.address === e.target.value);
                  setSelectedInterface(iface || null);
                }}
                className="w-full border-2 border-ink p-1.5 font-mono text-xs bg-white dark:bg-black text-ink dark:text-white shadow-brutal-xs cursor-pointer font-bold"
              >
                {interfaces.map((i) => (
                  <option key={i.address} value={i.address}>
                    {i.interface} ({i.isWifi ? 'Wi-Fi' : 'Ethernet'} - {i.address})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Instructions Box */}
          <div className="w-full mt-4 border-2 border-ink bg-pop-cyan/20 p-2.5 font-mono text-xs text-ink dark:text-white space-y-1">
            <div className="font-bold flex items-center gap-1 text-[11px] uppercase">
              <Smartphone className="w-3.5 h-3.5" /> Mobile Quick Start:
            </div>
            <p className="text-[11px] leading-tight text-gray-800 dark:text-gray-200">
              1. Connect phone to the same Wi-Fi network.<br />
              2. Open native camera and point at this QR.<br />
              3. Tap popup link to transfer immediately!
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Expandable QR Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="brutal-card p-6 bg-white dark:bg-canvas-dark text-ink dark:text-white max-w-md w-full relative animate-pop-pulse">
            <button
              onClick={() => {
                sound.playClick();
                setIsExpanded(false);
              }}
              className="brutal-btn absolute top-3 right-3 bg-pop-coral text-white p-1.5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <h3 className="font-display font-black text-2xl uppercase">⚡ Scan to Connect</h3>
              <p className="font-mono text-xs text-gray-600 dark:text-gray-300 mt-1">
                Scan with any iPhone or Android camera
              </p>
            </div>

            <div className="border-3 border-ink p-4 bg-pop-yellow shadow-brutal flex justify-center mx-auto w-fit">
              <img
                src={qrDataUrl}
                alt="AirDrop Local Pairing QR Full"
                className="w-64 h-64 object-contain"
              />
            </div>

            <div className="mt-4 p-2.5 bg-canvas-light dark:bg-black border-2 border-ink font-mono text-center text-sm font-bold truncate">
              {activeUrl}
            </div>

            <button
              onClick={handleCopy}
              className="brutal-btn w-full mt-3 bg-pop-green text-ink py-2 text-sm font-black flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY PAIRING LINK'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

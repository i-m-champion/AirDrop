import React, { useState } from 'react';
import { Send, Copy, Check, ExternalLink, Trash2, Zap, MessageSquare } from 'lucide-react';
import { sound } from '../utils/sound.js';
import { formatTime } from '../utils/format.js';

export function BeamCard({ beams, onBeam, onDeleteBeam, onClearBeams, onToast }) {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onBeam(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.text);
      sound.playCopy();
      setCopiedId(item.id);
      if (onToast) {
        onToast({
          type: 'success',
          title: 'COPIED TO CLIPBOARD',
          message: item.text.length > 50 ? `${item.text.slice(0, 50)}...` : item.text,
        });
      }
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <div className="brutal-card p-5 bg-white dark:bg-canvas-dark dark:text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b-3 border-ink pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pop-cyan border-2 border-ink" />
          <h2 className="font-display font-black text-lg tracking-tight uppercase">
            ⚡ Beam Text / Link
          </h2>
        </div>
        {beams.length > 0 && (
          <button
            onClick={() => {
              sound.playDelete();
              onClearBeams();
            }}
            className="text-[11px] font-mono text-gray-500 hover:text-pop-coral underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste link, note, code, or password here..."
            rows={3}
            className="w-full border-3 border-ink p-3 font-mono text-xs sm:text-sm bg-white dark:bg-black text-ink dark:text-white shadow-brutal-xs focus:outline-none focus:border-pop-yellow resize-none"
          />
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="hidden sm:inline font-mono text-[10px] text-gray-500">
            Press <kbd className="border border-ink px-1 bg-gray-100 dark:bg-gray-800">⌘/Ctrl + Enter</kbd> to beam
          </span>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="brutal-btn ml-auto bg-pop-yellow text-ink px-4 py-2 text-xs font-black flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-ink" />
            <span>BEAM NOW</span>
          </button>
        </div>
      </form>

      {/* Live Stream of Beams */}
      <div className="flex-1 overflow-y-auto max-h-[340px] space-y-3 pr-1">
        {beams.length === 0 ? (
          <div className="border-2 border-dashed border-gray-400 dark:border-gray-600 p-6 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="font-mono text-xs">No text beamed yet.</p>
            <p className="font-mono text-[10px] mt-1">Beam a message or URL to all synced devices!</p>
          </div>
        ) : (
          beams.map((b) => (
            <div
              key={b.id}
              className="border-2 border-ink p-3 bg-canvas-light dark:bg-black shadow-brutal-xs transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 border-b border-gray-300 dark:border-gray-700 pb-1">
                <span className="font-bold text-pop-coral flex items-center gap-1">
                  <span>📱</span> {b.sender || 'Peer'}
                </span>
                <span className="text-gray-500 text-[10px]">{formatTime(b.createdAt)}</span>
              </div>

              <div className="font-mono text-xs sm:text-sm break-words whitespace-pre-wrap select-text mb-2.5">
                {b.text}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-200 dark:border-gray-800">
                {b.isUrl && (
                  <a
                    href={b.text}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-btn bg-pop-cyan text-ink px-2 py-1 text-[11px] flex items-center gap-1"
                    title="Open Link"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>OPEN ↗</span>
                  </a>
                )}

                <button
                  onClick={() => handleCopy(b)}
                  className="brutal-btn bg-white dark:bg-canvas-dark text-ink dark:text-white px-2.5 py-1 text-[11px] flex items-center gap-1 font-bold"
                  title="Copy to clipboard"
                >
                  {copiedId === b.id ? (
                    <>
                      <Check className="w-3 h-3 text-pop-green" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onDeleteBeam(b.id)}
                  className="brutal-btn bg-pop-coral text-white p-1 text-[11px]"
                  title="Delete snippet"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

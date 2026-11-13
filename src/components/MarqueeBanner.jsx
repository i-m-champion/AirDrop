import React from 'react';

export function MarqueeBanner({ primaryIp, port }) {
  const text = `⚡ DIRECT WI-FI P2P ⚡ ZERO CLOUD ⚡ 100% PRIVATE ⚡ UNLIMITED FILE SIZE ⚡ MAC • IPHONE • ANDROID • PC ⚡ WI-FI IP: ${primaryIp || '192.168.1.X'}:${port || '3000'} ⚡ NO APP INSTALL REQUIRED ⚡ `;

  return (
    <div className="bg-pop-yellow border-b-3 border-ink overflow-hidden py-1.5 font-mono text-xs font-black tracking-widest text-ink select-none flex">
      <div className="whitespace-nowrap animate-marquee flex items-center">
        <span>{text}</span>
        <span>{text}</span>
      </div>
      <div className="whitespace-nowrap animate-marquee flex items-center" aria-hidden="true">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}

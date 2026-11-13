/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#F7F7F2',
          DEFAULT: '#F7F7F2',
          dark: '#0A0A0A',
        },
        pop: {
          yellow: '#FFE600', // Electric Yellow (Primary Pop)
          green: '#00FF66',  // Acid Green (Signal/Success)
          coral: '#FF4757',  // Hot Coral (Attention)
          cyan: '#00E5FF',   // Electric Cyan
          magenta: '#FF0055', // Hot Magenta
        },
        ink: '#000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      boxShadow: {
        'brutal-xs': '2px 2px 0px #000000',
        'brutal': '4px 4px 0px #000000',
        'brutal-lg': '6px 6px 0px #000000',
        'brutal-xl': '8px 8px 0px #000000',
        'brutal-cyan': '4px 4px 0px #00E5FF',
        'brutal-yellow': '4px 4px 0px #FFE600',
        'brutal-green': '4px 4px 0px #00FF66',
        'brutal-white': '4px 4px 0px #FFFFFF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Syne', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        popPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        wiggle: 'wiggle 2s ease-in-out infinite',
        'pop-pulse': 'popPulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

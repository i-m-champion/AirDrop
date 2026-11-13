# ⚡ AirDrop Local // Neo-Brutalist P2P Wi-Fi Transfer

> Cross-platform, bidirectional local file transfer and text beam web app running on macOS that transfers files and notes between Mac, Android, iPhone, and PC over local Wi-Fi with **zero app installation**.

Styled with the **`kinetic-ui`** design system following **Archetype 028: Concept D (Neo-Brutalist / Electric Pop)**.

---

## 🎨 Visual & UI Design System (Concept D: Neo-Brutalist)

- **Color Tokens:**
  - Canvas: Off-white / Cream `#F7F7F2` with Stark Black `#0A0A0A` dark mode support
  - Accent 1 (Primary Pop): Electric Yellow `#FFE600`
  - Accent 2 (Success/Signal): Acid Green `#00FF66`
  - Accent 3 (Attention): Hot Coral `#FF4757` & Electric Cyan `#00E5FF`
  - Ink & Borders: Pitch Black `#000000` with 3px solid borders (`border-3 border-black`)
- **Brutalist Physics & Surfaces:**
  - Solid, unblurred 4px & 6px hard drop shadows (`box-shadow: 4px 4px 0px #000000`, `6px 6px 0px #000000`)
  - Tactile button press micro-interaction (`active:translate-x-[2px] active:translate-y-[2px]`)
  - Playful tilted sticker badges (`⚡ LOCAL WI-FI ONLY`, `🔒 NO CLOUD / 100% PRIVATE`, `📱 ANDROID & iOS READY`, `🚀 ZERO LIMITS`)
  - Custom desktop kinetic brutalist pointer with hover snapping (disabled on mobile touch devices)
- **Typography:**
  - Display: Heavy grotesque sans (**Space Grotesk** & **Syne** 800/900)
  - Telemetry: Monospace (**JetBrains Mono** & **Space Mono**) for file sizes, IPs, and transfer speeds
- **Haptic Audio (Web Audio API):**
  - Procedural sound synthesis: tactile clicks, ascending celebratory chime for transfers, 2-tone futuristic beam notification, snappy copy pop, and mute/unmute control.

---

## 📱 Dual Responsive Layout

### Desktop (Mac / Laptop)
- **Left Column:**
  - Bold framed pairing QR code card (interactive dynamic QR encoding `http://<MAC_IP>:<PORT>`)
  - Network interface selector for multi-homed devices (Wi-Fi, Ethernet, Hotspot)
  - One-click copy link & full-screen QR modal for room-scale mobile scanning
  - Live Text & Link Beam card with instant broadcast and 1-tap clipboard copy
- **Right Column:**
  - Massive dashed neo-brutalist dropzone with spring drag-over animation
  - Real-time upload progress bar with live transfer speed (MB/s) and byte telemetry
  - Live transfer feed of incoming/outgoing files with one-click download, media preview modal, and delete actions
  - Batch **Download All (.ZIP)** packaging

### Mobile (Android & iPhone)
- Touch-optimized controls with zero custom cursor interference (`pointer: coarse` safe)
- Prominent tactile tap targets: **Select Photos / Files** and **Take Photo / Camera** (`capture="environment"`)
- Direct one-tap file downloading and instant clipboard copying

---

## 🔒 100% Local LAN Security & Privacy

Transfers flow directly over your local Wi-Fi router via local socket and HTTP streaming. **Zero data ever leaves your local network or touches external cloud servers.**

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ (Tested on Node v20+ and v26+)
- npm or yarn

### 1. Installation
```bash
git clone https://github.com/i-m-champion/AirDrop.git
cd AirDrop
npm install
```

### 2. Launch
```bash
npm start
```
> The startup script will automatically build the frontend assets (`npm run build`) and boot up the Express + WebSocket server.

Upon startup, the terminal displays an ASCII QR code along with the host IP:
```text
================================================================
⚡  AIRDROP LOCAL // NEO-BRUTALIST P2P WI-FI TRANSFER
================================================================
📡 Host Machine : Ayushs-MacBook-Air-5.local (darwin)
🌐 Primary Wi-Fi: 192.168.1.211:3000
🔗 Browser Link : http://192.168.1.211:3000
================================================================
📱 SCAN WITH IPHONE / ANDROID CAMERA TO PAIR INSTANTLY:

  [ ASCII QR CODE EMBEDDED IN TERMINAL ]

⚡ Status: Server listening on 0.0.0.0:3000
🔒 Privacy: 100% Local Wi-Fi Router Only (Zero External Cloud)
================================================================
```

### 3. Connect Any Device
1. Ensure your iPhone, Android phone, or PC is connected to the same Wi-Fi network.
2. Open your phone's native camera and point it at the QR code (either on your Mac screen or in the terminal).
3. Tap the yellow pop link to open the web app.
4. Start transferring files and beaming text bidirectionally!

---

## 🛠 Project Architecture

```text
AirDrop/
├── server/
│   ├── banner.js          # Terminal ASCII QR code and startup art
│   ├── beam.js            # Live clipboard / text sync storage
│   ├── device.js          # User-Agent device parsing & labels
│   ├── index.js           # Express + WebSocket HTTP server entry
│   ├── network.js         # Interface discovery & Wi-Fi IP detection
│   ├── routes.js          # REST API endpoints (upload, preview, zip, finder)
│   ├── storage.js         # File metadata registry & disk manager
│   ├── upload.js          # Multer streaming disk storage engine
│   └── websocket.js       # Real-time peer presence & event broadcasting
├── src/
│   ├── components/
│   │   ├── BeamCard.jsx          # Live text / link beam sync
│   │   ├── BrutalistCursor.jsx   # Desktop kinetic cursor
│   │   ├── DropZone.jsx          # Tactile drag-and-drop dropzone
│   │   ├── FileList.jsx          # Live file stream & download actions
│   │   ├── Header.jsx            # Brand masthead, stickers, peer counter
│   │   ├── MarqueeBanner.jsx     # High-voltage infinite ticker
│   │   ├── PairingCard.jsx       # QR pairing card with IP selector
│   │   ├── PeersModal.jsx        # Active peer device inspector
│   │   ├── PreviewModal.jsx      # Lightbox preview (images, video, audio, code)
│   │   ├── Toast.jsx             # Brutalist alert notifications
│   │   └── UploadProgress.jsx    # Real-time bandwidth gauge
│   ├── hooks/
│   │   └── useAirDropSocket.js   # Real-time WebSocket synchronization hook
│   ├── utils/
│   │   ├── format.js             # Byte formatting, mime lookup & time ago
│   │   └── sound.js              # Web Audio procedural synthesizer
│   ├── App.jsx                   # Dual responsive layout container
│   ├── index.css                 # Neo-Brutalist design tokens & physics
│   └── main.jsx                  # React application entry
├── uploads/                      # Local storage directory for transferred files
├── index.html                    # HTML shell with Google Fonts
├── package.json                  # Scripts & dependencies
├── tailwind.config.js            # Neo-Brutalist color palette & hard shadows
└── vite.config.js                # Vite build configuration
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/info` | Returns host Wi-Fi IP, platform, telemetry, and storage statistics |
| `GET` | `/api/qr` | Generates a high-contrast Neo-Brutalist QR code data URL |
| `GET` | `/api/files` | Lists all uploaded files with metadata |
| `POST` | `/api/upload` | Multi-file streaming upload (Multer disk storage) |
| `GET` | `/api/download/:filename` | Downloads target file with attachment headers |
| `GET` | `/api/preview/:filename` | Streams inline preview with HTTP 206 partial range seeking |
| `DELETE` | `/api/files/:id` | Deletes a file from the server |
| `DELETE` | `/api/files` | Clears all files from the server |
| `GET` | `/api/download-all` | Streams all current files as a `.zip` archive |
| `POST` | `/api/open-folder` | Opens the `./uploads` folder in macOS Finder (`open uploads`) |
| `GET` | `/api/beam` | Returns text / clipboard beam history |
| `POST` | `/api/beam` | Broadcasts text snippet / URL to all connected peers |
| `DELETE` | `/api/beam/:id` | Deletes a beamed snippet |

---

## 📄 License

MIT License. Built with passion for local privacy and high craft.

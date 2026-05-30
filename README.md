# Artemis X-II

Multi-chain bump bot suite. One codebase; every platform.

## Platforms

| Platform | How |
|---|---|
| Web (Desktop / Mobile / Tablet) | Deploy `dist/` to Vercel, Netlify, or any static host |
| Windows (.exe) | Build with Tauri |
| macOS (.app) | Build with Tauri |
| Linux | Build with Tauri |
| iOS / Android | Build with Tauri v2 mobile |

## Quick Start (Web)

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Build for Production (Web)

```bash
npm run build
# dist/ folder is ready for Vercel / Netlify / FTP
```

## Build Desktop App (.exe)

See BUILD.md for full instructions.

Quick version (requires Rust):

```bash
# 1. Install Rust: https://rustup.rs
# 2. Install Tauri CLI
npm install

# 3. Generate app icons (optional)
npm run tauri icon path/to/your-icon.png

# 4. Build Windows .exe
npm run tauri:build
# Output: src-tauri/target/release/bundle/msi/ArtemisX-II_2.0.0_x64_en-US.msi
# Output: src-tauri/target/release/bundle/nsis/ArtemisX-II_2.0.0_x64-setup.exe
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys.

| Variable | Purpose |
|---|---|
| `VITE_HELIUS_API_KEY` | Helius RPC + WebSocket |
| `VITE_DISCORD_WEBHOOK_URL` | Bump alerts to Discord |
| `VITE_SOLANA_RPC_URL` | Custom Solana endpoint |

## License

Extended License — see LICENSE-TERMS.md

# Build Guide — Artemis X-II

## Prerequisites

### All Platforms
- Node.js 18+ (LTS recommended)
- npm or yarn

### Desktop Only (Tauri)
- Rust toolchain: install from https://rustup.rs
- Windows: Microsoft Visual Studio C++ Build Tools
- macOS: Xcode Command Line Tools

---

## 1. Web Deployment

### Development
```bash
npm install
npm run dev
```
Visit `http://localhost:5173`

### Production Build
```bash
npm run build
```
The `dist/` folder contains static files ready for any web host.

### Deploy to Vercel
```bash
# Option A: Drag & Drop
npm run build
# Drag dist/ folder to https://vercel.com/new

# Option B: GitHub + Vercel
# 1. Push this repo to GitHub
# 2. Import repo in Vercel dashboard
# 3. Build command: npm run build
# 4. Output directory: dist
```

---

## 2. Desktop App (.exe / .app / Linux)

### Install Tauri CLI
```bash
npm install
# This installs @tauri-apps/cli locally
```

### Generate Icons (Optional)
Prepare a 1024x1024 PNG logo, then:
```bash
npx tauri icon ./path/to/logo.png
```
This creates all required icon sizes in `src-tauri/icons/`.

### Development Mode (Desktop)
```bash
npm run tauri:dev
```
Opens a native window with hot-reload.

### Build Windows Installer
```bash
npm run tauri:build
```

Outputs:
- `src-tauri/target/release/bundle/msi/` — Windows MSI installer
- `src-tauri/target/release/bundle/nsis/` — Windows NSIS installer (.exe)
- `src-tauri/target/release/bundle/dmg/` — macOS DMG (on macOS only)
- `src-tauri/target/release/bundle/appimage/` — Linux AppImage (on Linux only)

### Build for Specific Target
```bash
# Windows from macOS/Linux (requires cross-compilation setup)
npx tauri build --target x86_64-pc-windows-msvc

# macOS from macOS
npx tauri build --target aarch64-apple-darwin  # Apple Silicon
npx tauri build --target x86_64-apple-darwin    # Intel Mac
```

---

## 3. Mobile (iOS / Android)

Tauri v2 supports mobile builds from the same codebase.

### iOS (requires macOS + Xcode)
```bash
npm run tauri ios dev      # Simulator
npm run tauri ios build    # Archive for App Store
```

### Android
```bash
npm run tauri android dev   # Emulator
npm run tauri android build # APK / AAB
```

---

## Troubleshooting

### "tauri command not found"
```bash
npx tauri --version
# Use npx tauri <command> instead of npm run tauri
```

### Rust compilation errors on Windows
Install Visual Studio Build Tools with "Desktop development with C++" workload.

### Vite port already in use
Tauri expects port 1420. If occupied, kill the process or change in `vite.config.ts`.

### Icons missing
Tauri requires icon files. Either:
- Run `npx tauri icon ./your-logo.png`
- Or create placeholder PNGs in `src-tauri/icons/`

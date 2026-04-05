# Desktop App Documentation

## Overview

The TF2 Calculator desktop app is an Electron-based application that embeds the React calculator UI. It provides a standalone installable application for Windows, macOS, and Linux.

## Architecture

### Technology Stack

- **Framework:** Electron 33+
- **UI:** React 19 (via @tf2calc/react-ui)
- **Engine:** @tf2calc/core (bundled)
- **Build Tool:** Vite
- **Package Management:** npm workspaces

### File Structure

```
apps/desktop/
├── electron/
│   └── main.cjs              # Electron main process
├── src/
│   ├── app.jsx               # React app entry
│   └── styles.css            # App-level styles
├── index.html                # HTML template
├── vite.config.js            # Vite build config
├── package.json              # Desktop app manifest
├── dist/                      # Built output (generated)
└── dist-electron/            # Packaged app (generated)
```

### Process Architecture

```
┌─────────────────────────────────────┐
│  Electron Main Process              │
│  (electron/main.cjs)                │
│  - Window management                │
│  - IPC communication                │
│  - App lifecycle                    │
└──────────────┬──────────────────────┘
               │
               │ IPC Bridge
               ▼
┌─────────────────────────────────────┐
│  Electron Renderer Process          │
│  - React UI                         │
│  - @tf2calc/react-ui component     │
│  - Calculator engine (@tf2calc/core)│
└─────────────────────────────────────┘
```

## Development

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Visual Studio Code (recommended)

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run desktop:dev
   ```

   This starts:
   - Vite dev server on `http://localhost:5173`
   - Electron app window (hot-reloading on changes)

3. **Work on the app:**

   - Edit React components in `apps/desktop/src/`
   - Edit main process code in `apps/desktop/electron/main.cjs`
   - Save to auto-reload in dev window

### Available Scripts

```bash
# Development
npm run desktop:dev                  # Start dev server with Electron

# Building
npm run desktop:build               # Build production bundle
npm run build:desktop               # Alias for build

# Packaging
npm run desktop:package             # Build and package for distribution
npm run desktop:preview             # Preview packaged app

# Cleaning
npm run desktop:clean               # Remove dist and dist-electron
```

## Building

### Development Build

```bash
npm run desktop:dev
```

Creates a development Electron window with hot module reloading enabled.

### Production Build

```bash
npm run desktop:build
```

Creates optimized production bundle:
- All CSS is minified and inlined
- React is built in production mode
- No source maps (unless explicitly enabled)
- Output: `apps/desktop/dist/`

### Packaging for Distribution

```bash
npm run desktop:package
```

This:

1. **Builds** the Vite bundle (production mode)
2. **Packages** with electron-builder:
   - Creates Windows installer (.exe)
   - Creates macOS app (.dmg, .zip)
   - Creates Linux package (.snap, .AppImage)
3. **Output:** `apps/desktop/dist-electron/`

## Build Configuration

### Vite Config

See `apps/desktop/vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for packaging
  build: {
    outDir: 'dist',
    minify: 'terser',
  },
})
```

### Electron Main Config

See `apps/desktop/electron/main.cjs`:

```js
const mainWindow = new BrowserWindow({
  width: 800,
  height: 900,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    nodeIntegration: false,
    contextIsolation: true,
  },
})
```

**Key Security Features:**
- `nodeIntegration: false` – Disables Node.js in renderer
- `contextIsolation: true` – Isolates context from main process
- Preload script for safer IPC communication

### electron-builder Config

See `apps/desktop/package.json`:

```json
{
  "build": {
    "asar": true,
    "win": {
      "target": ["nsis", "portable"],
      "certificateFile": null
    },
    "mac": {
      "target": ["dmg", "zip"]
    },
    "linux": {
      "target": ["AppImage"]
    }
  }
}
```

## Packaging

### Windows

Building on Windows creates:

- **NSIS Installer** (`TF2Calculator.exe`) – Full installer with shortcuts
- **Portable** (`TF2Calculator-portable.exe`) – Single file, no installation

### macOS

Building on macOS (or via CI) creates:

- **DMG** (`TF2Calculator.dmg`) – Standard macOS installer
- **ZIP** (`TF2Calculator-mac.zip`) – Zipped app bundle

### Linux

Building on Linux creates:

- **AppImage** (`TF2Calculator.AppImage`) – Self-contained, single file
- **Snap** (optional, requires snapcraft)

## Installation

### End Users

Users download the appropriate installer for their OS:

- Windows: Run `.exe` installer
- macOS: Open `.dmg` and drag to Applications
- Linux: Make AppImage executable and run, or use package manager

### For Developers

To test the packaged app locally:

```bash
npm run desktop:preview
```

This opens the packaged app (simulates what end users see).

## Development to Production Flow

1. **Local Development:**
   ```bash
   npm run desktop:dev
   ```
   Make changes, see live updates in Electron window.

2. **Testing:**
   - Test all calculator features
   - Test keyboard shortcuts
   - Test UI responsiveness

3. **Build Production:**
   ```bash
   npm run desktop:build
   ```

4. **Package for Distribution:**
   ```bash
   npm run desktop:package
   ```

5. **Distribution:**
   - Upload installers to release page
   - OR push to app store (Windows Store, Mac App Store, Snap Store)

## Hot Module Reloading (HMR)

In development mode, changes auto-reload:

- **React components** – Instant reload (preserves state when possible)
- **Styles** – Instant refresh without reload
- **Main process** – Requires manual restart

To restart main process:

```bash
# In dev mode, close the Electron window
# It will automatically restart
```

Or press `Ctrl+R` (Cmd+R on macOS) in the Electron window.

## Environment Variables

Development:

```bash
NODE_ENV=development
VITE_DEV_SERVER_URL=http://localhost:5173
```

Production:

```bash
NODE_ENV=production
```

## Performance Notes

### App Size

- Installed size: ~150–200 MB (includes Chromium)
- Compressed installer: ~80–120 MB

### Memory Usage

- Idle: ~100–150 MB (typical Electron baseline)
- Active calculation: ~120–160 MB
- With multiple windows: +50–100 MB per window

### Startup Time

- Cold start: 1–3 seconds
- Warm start (cached): <1 second
- First calculation: <10ms

## Troubleshooting

### App Won't Start

1. Check Node version: `node --version` should be 18+
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Clear Vite cache: `npm run desktop:clean`
4. Try dev mode: `npm run desktop:dev`

### Slow Build

- Clear cache: `npm run desktop:clean`
- Check disk space (need 1+ GB)
- Restart: `npm install` + `npm run desktop:build`

### Packaging Fails

- Ensure all dependencies installed: `npm install`
- Check Electron version matches config
- On macOS: May need code signing certificate
- On Windows: May need Visual Studio build tools

### Build Size Too Large

- Check for duplicate dependencies: `npm ls`
- Verify core engine is bundled (not duplicated)
- Review Vite build output: `npm run desktop:build --verbose`

## Security Considerations

### IPC Communication

- Validate all messages from renderer process
- Use `contextIsolation` and preload scripts
- Don't expose sensitive APIs to renderer

### Updates

Consider implementing auto-update with `electron-updater`:

```js
import { autoUpdater } from 'electron-updater'

autoUpdater.checkForUpdatesAndNotify()
```

### Code Signing

For production releases, code-sign the app:

1. Obtain certificate for your OS
2. Update electron-builder config
3. Set CERTIFICATE env variables before packaging

### Sensitive Data

- Never store credentials in app files
- Use OS keychain for sensitive data
- Don't log PII or calculation history to disk

## Customization

### Window Size

Edit `electron/main.cjs`:

```js
const mainWindow = new BrowserWindow({
  width: 1024,   // Change width
  height: 768,   // Change height
  // ...
})
```

### App Icon

Add icon to `apps/desktop/`:

```
apps/desktop/
├── icon.png              # 512x512 for all platforms
├── icon.icns             # macOS (optional)
├── icon.ico              # Windows (optional)
```

Update build config in `package.json`:

```json
{
  "build": {
    "icon": "./icon"
  }
}
```

### App Title

Edit `index.html`:

```html
<title>My TF2 Calculator</title>
```

And `electron/main.cjs`:

```js
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  if (url.startsWith('https:')) return { action: 'allow' }
  return { action: 'deny' }
})
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Package App

on:
  push:
    tags: ['v*']

jobs:
  package:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run desktop:package
      - uses: softprops/action-gh-release@v1
        with:
          files: apps/desktop/dist-electron/*
```

## Release Checklist

- [ ] Bump version in `apps/desktop/package.json`
- [ ] Update CHANGELOG
- [ ] Test all platforms (Windows, macOS, Linux)
- [ ] Run `npm run desktop:package`
- [ ] Test installers on clean systems
- [ ] Create GitHub release with binaries
- [ ] Announce in community

## Future Enhancements

- [ ] Auto-update functionality
- [ ] Multiple calculator windows
- [ ] Calculation history export
- [ ] Settings persistence
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcut customization
- [ ] Plugin system for extensions

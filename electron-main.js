/**
 * electron-main.js
 * Smart Learn — Electron Desktop App Main Process
 * Spawns the Express backend, creates the native BrowserWindow, and manages system tray.
 */

const { app, BrowserWindow, Tray, Menu, ipcMain, shell, nativeImage } = require('electron');
const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs   = require('fs');

// No longer need to resolve system node path as we use Electron's internal Node process.execPath.


// ── Constants ────────────────────────────────────────────────────────────────
const SERVER_PORT = 8080;
const APP_URL     = `http://localhost:${SERVER_PORT}`;
const APP_TITLE   = 'Smart Learn';

let mainWindow  = null;
let tray        = null;
let serverProc  = null;

// ── Prevent multiple instances ───────────────────────────────────────────────
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// ── Start Express Backend Server ─────────────────────────────────────────────
function startServer() {
  return new Promise((resolve, reject) => {
    const userDataPath = app.getPath('userData');
    console.log('[Electron] App UserData Path:', userDataPath);

    // Spawn server.js as a child process using the Electron binary itself (with ELECTRON_RUN_AS_NODE=1)
    serverProc = spawn(process.execPath, [path.join(__dirname, 'server.js')], {
      cwd: __dirname,
      env: { 
        ...process.env, 
        ELECTRON_RUN: '1',
        ELECTRON_RUN_AS_NODE: '1',
        USER_DATA_PATH: userDataPath
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    serverProc.stdout.on('data', (data) => {
      const msg = data.toString();
      console.log('[Server]', msg.trim());
      if (msg.includes('running at')) resolve();
    });

    serverProc.stderr.on('data', (data) => {
      console.error('[Server Error]', data.toString().trim());
    });

    serverProc.on('error', reject);

    // Fallback: poll until server responds
    const deadline = Date.now() + 12000;
    const poll = () => {
      http.get(APP_URL, () => resolve()).on('error', () => {
        if (Date.now() < deadline) setTimeout(poll, 400);
        else reject(new Error('Server did not start in time'));
      });
    };
    setTimeout(poll, 800);
  });
}

// ── Tray Icon (SVG as NativeImage) ───────────────────────────────────────────
function buildTrayIcon() {
  // 16×16 PNG icon encoded as base64 (simple gradient square with "SL" text)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00f2fe"/>
        <stop offset="100%" stop-color="#4facfe"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="12" fill="url(#g)"/>
    <text x="8" y="46" font-family="Arial Black,sans-serif" font-weight="900"
          font-size="32" fill="#0a081a">SL</text>
  </svg>`;

  const dataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  return nativeImage.createFromDataURL(dataUrl).resize({ width: 32, height: 32 });
}

// ── Create BrowserWindow ─────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: APP_TITLE,
    icon: buildTrayIcon(),
    backgroundColor: '#0a081a',
    show: false,            // show only once ready-to-show
    frame: false,           // custom title bar
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js'),
    },
  });

  // Load app
  mainWindow.loadURL(APP_URL);

  // Show smoothly once rendered
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in default browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── System Tray ──────────────────────────────────────────────────────────────
function createTray() {
  tray = new Tray(buildTrayIcon());
  tray.setToolTip(APP_TITLE);

  const menu = Menu.buildFromTemplate([
    {
      label: '📚 Open Smart Learn',
      click: () => {
        if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
        else createWindow();
      },
    },
    { type: 'separator' },
    {
      label: '🌐 Open in Browser',
      click: () => shell.openExternal(APP_URL),
    },
    { type: 'separator' },
    {
      label: '❌ Quit',
      click: () => { app.isQuitting = true; app.quit(); },
    },
  ]);

  tray.setContextMenu(menu);

  // Single click: toggle window
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// ── IPC Handlers (title bar controls) ────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.hide(); // hide to tray instead of closing
});
ipcMain.on('window-quit', () => { app.isQuitting = true; app.quit(); });

// Relay maximize state to renderer
ipcMain.handle('window-is-maximized', () => mainWindow && mainWindow.isMaximized());

// ── App Lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  try {
    console.log('[Electron] Starting Smart Learn server…');
    await startServer();
    console.log('[Electron] Server ready. Opening window…');
    createWindow();
    createTray();
  } catch (err) {
    console.error('[Electron] Failed to start server:', err.message);
    // Still try to open the window – server might already be running
    createWindow();
    createTray();
  }
});

// macOS: re-create window on dock icon click
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Prevent quit when all windows closed (minimise to tray)
app.on('window-all-closed', (e) => {
  if (process.platform !== 'darwin' && !app.isQuitting) {
    e.preventDefault();
  }
});

// Cleanup: kill server on quit
app.on('before-quit', () => {
  app.isQuitting = true;
  if (serverProc && !serverProc.killed) {
    console.log('[Electron] Stopping server…');
    serverProc.kill('SIGTERM');
  }
});

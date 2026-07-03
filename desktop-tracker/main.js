const { app, BrowserWindow, ipcMain, Notification, powerMonitor, shell, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
const screenshot = require('screenshot-desktop');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.fluidhr.tracker');
}

// Window transparency fixes for Windows 11
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-rasterization');

const store = new Store();
let mainWindow;

// ── MUST match backend IDLE_THRESHOLD_SECONDS ─────────────
const IDLE_THRESHOLD = 60; // 1 minute (60 seconds)

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 720,
    resizable: false,
    frame: false,
    transparent: false,
    alwaysOnTop: false,
    hasShadow: true,
    thickFrame: false,
    roundedCorners: false,
    show: false,
    skipTaskbar: false,
    autoHideMenuBar: true,
    backgroundColor: '#1E2026',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      mainWindow.show();
      mainWindow.focus();
    }, 600);
  });
}

// ── SINGLE INSTANCE LOCK ──────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();

    // ============================================================
    // 🌐 SYSTEM-WIDE IDLE MONITOR — MAIN PROCESS ONLY
    // ============================================================
    // powerMonitor.getSystemIdleTime() reads from the OS kernel.
    // It counts seconds since the last keyboard/mouse event on the
    // ENTIRE machine — Chrome, Word, VS Code, WhatsApp, anything.
    // This fires every second regardless of Electron window focus.
    // ============================================================
    setInterval(() => {
      if (!mainWindow || mainWindow.isDestroyed()) return;

      const idleSeconds = powerMonitor.getSystemIdleTime();
      const isIdle = idleSeconds >= IDLE_THRESHOLD;

      // Always log so you can verify in terminal
      console.log(`[DEBUG] System Idle Seconds: ${idleSeconds} | Threshold: ${IDLE_THRESHOLD}`);

      // Send to renderer via IPC — renderer ONLY displays/reacts
      mainWindow.webContents.send('system-idle-status', {
        idleSeconds,
        isIdle
      });
    }, 500); // 🚀 Higher precision for snappier sync
    // ============================================================
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── IPC HANDLERS ─────────────────────────────────────────
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('close-app', () => {
  app.quit();
});

ipcMain.handle('minimize-app', () => {
  mainWindow.minimize();
});

ipcMain.handle('notify-native', (event, payload) => {
  const { title, body } = payload || {};
  const allowedTitles = ['started', 'paused', 'resumed', 'stopped', 'screenshot', 'inactivity', 'idle', 'announcement'];
  const isAllowed = allowedTitles.some(t => title?.toLowerCase().includes(t));
  if (!isAllowed) {
    console.log('Notification blocked (not critical):', title);
    return false;
  }
  try {
    const notification = new Notification({
      title: title || 'FluidHR Tracker',
      body: body || '',
      silent: false
    });
    notification.on('failed', (event, error) => console.error('Notification failed:', error));
    notification.show();
    return true;
  } catch (err) {
    console.error('Notification error:', err);
    return false;
  }
});

ipcMain.handle('capture-screen', async () => {
  try {
    let screenId = undefined;
    try {
      const displays = await screenshot.listDisplays();
      if (displays && displays.length > 1) {
        const activeDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
        let bestMatch = displays[0];
        let minDistance = Infinity;
        for (const disp of displays) {
          const dx = Math.abs(disp.left - activeDisplay.bounds.x);
          const dy = Math.abs(disp.top - activeDisplay.bounds.y);
          const dist = dx + dy;
          if (dist < minDistance) {
            minDistance = dist;
            bestMatch = disp;
          }
        }
        screenId = bestMatch.id;
      }
    } catch (err) {
      console.error('Error listing displays for screenshot:', err);
    }

    const options = { format: 'jpeg' };
    if (screenId) {
      options.screen = screenId;
    }
    const imgBuffer = await screenshot(options);
    return `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Capture Error:', err);
    return null;
  }
});

// ── AUTO-UPDATER EVENTS & HANDLERS ───────────────────────
autoUpdater.on('update-available', () => {
  console.log('[Updater] Update available. Downloading in background...');
});

autoUpdater.on('update-downloaded', () => {
  const { dialog } = require('electron');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version of FluidHR Tracker has been downloaded. Restart now to apply the update?',
    buttons: ['Restart', 'Later']
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

ipcMain.handle('check-for-updates', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

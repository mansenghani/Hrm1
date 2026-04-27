const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.fluidhr.tracker');
}

// 🛡️ ABSOLUTE ZERO TRANSPARENCY: Force DWM to honor transparency
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-direct-composition'); // 🛡️ Veto Win 11 compositing bugs
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

const store = new Store();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 650,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false, // 🛡️ Use CSS shadow instead of native window shadow to keep square corners
    thickFrame: false,
    roundedCorners: false, // 🛡️ DISABLE SYSTEM ROUNDED CORNERS TO PREVENT VISIBLE CORNER BLEED
    show: false,
    skipTaskbar: false,
    autoHideMenuBar: true,
    backgroundColor: '#00000000', // 🛡️ Explicit transparent background for Windows
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');

  // 🛡️ DEEP SYNC PROTOCOL: Extended buffer for stubborn Win 11 compositors
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      mainWindow.show();
      mainWindow.focus();
    }, 600); 
  });
}

// 🛡️ SINGLE INSTANCE LOCK
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

  app.whenReady().then(createWindow);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 🔄 IPC HANDLERS FOR PERSISTENCE
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
  try {
    const notification = new Notification({
      title: title || 'FluidHR Tracker',
      body: body || '',
      silent: false
    });

    notification.on('show', () => {
      console.log('Native notification shown:', title);
    });
    notification.on('failed', (event, error) => {
      console.error('Native notification failed:', error);
    });

    notification.show();
    return true;
  } catch (err) {
    console.error('Native notification error:', err);
    return false;
  }
});

const { app, BrowserWindow, shell, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

/* Panel width targets */
const PANEL_WIDTHS = { 0: 480, 1: 480, 2: 860, 3: 1260, manage: 1100 };

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 720,
    minWidth: 340,
    minHeight: 400,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    backgroundColor: '#f8f9fb',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    resizable: true,
    title: 'ClassPanels',
  });

  mainWindow.loadFile('index.html');

  // Open external links in the system browser, not in the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // `npm start` runs inside the stock Electron shell, so give its Dock icon the
  // app icon. A packaged build already has it from the bundle.
  if (process.platform === 'darwin' && !app.isPackaged) {
    try {
      const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
      if (!icon.isEmpty()) app.dock.setIcon(icon);
    } catch (e) { /* a missing icon must never stop the window opening */ }
  }
  createWindow();
});

/* Resize window when panel count changes — only grow, never shrink */
ipcMain.on('resize-for-panels', (event, count) => {
  if (!mainWindow) return;
  const targetW = PANEL_WIDTHS[count] ?? 480;
  const [currentW, h] = mainWindow.getSize();
  const newW = Math.max(currentW, targetW);
  if (newW !== currentW) mainWindow.setSize(newW, h, true);
});

/* Automatic backups: save as a file Tom can find in Documents, keep the newest 30 */
ipcMain.handle('write-backup', async (event, name, json) => {
  try {
    // only our own file names, so the page can never write anywhere else
    if (typeof name !== 'string' || !/^ClassPanels-auto-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(name)) return false;
    if (typeof json !== 'string') return false;
    const dir = path.join(app.getPath('documents'), 'ClassPanels Backups');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), json);
    const old = fs.readdirSync(dir).filter(f => /^ClassPanels-auto-.*\.json$/.test(f)).sort().reverse().slice(30);
    for (const f of old) { try { fs.unlinkSync(path.join(dir, f)); } catch (e) {} }
    return true;
  } catch (e) { return false; } // a backup problem must never bother the app
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even with no windows (standard behaviour)
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // Re-create window when dock icon is clicked and no windows are open
  if (mainWindow === null) createWindow();
});

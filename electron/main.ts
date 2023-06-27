import {app, dialog, shell, BrowserWindow, Menu, ipcMain} from 'electron'
import path from 'node:path'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      sandbox: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    },
    // frame: false,
    titleBarOverlay: true,
    titleBarStyle: 'hidden'
    // thickFrame: true,
  })

  win.setMenu(null)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }

  win.on('ready-to-show', () => {
    if (!win) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      win.minimize();
    } else {
      win.show();
    }
    win.webContents.openDevTools()
  });

  win.on('closed', () => {
    win = null;
  });

  // Open urls in the user's browser
  win.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return {action: 'deny'};
  });
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('open-dir', (r) => {
  dialog.showOpenDialog({properties: ['openDirectory', 'dontAddToRecent']}).then(e => {
    r.sender.postMessage('open-dir', {path: e.canceled ? null : e.filePaths[0]})
  }, e => {
    r.sender.postMessage('open-dir', {error: e?.message})
  })
})

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      if (win === null) createWindow();
    });
  })
  .catch(console.log);



import path from 'path';
import { app, ipcMain, shell } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { addon as ov } from 'openvino-node';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('ov.getVersions', async (event) => {
  const core = new ov.Core();
  const device = 'CPU';
  const v = core.getVersions(device);

  event.reply('setOvInfo', v);
});

main();

async function main() {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 650,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarOverlay: true,
    autoHideMenuBar: true,
  });

  await loadWindowURL(mainWindow, 'home');

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url); // Open URL in user's browser.

    return { action: 'deny' }; // Prevent the app from opening the URL.
  });
}

async function loadWindowURL(
  window: Electron.CrossProcessExports.BrowserWindow,
  path: string,
) {
  if (isProd) return await window.loadURL(`app://./${path}`);

  const port = process.argv[2];

  await window.loadURL(`http://localhost:${port}/${path}`);
  // mainWindow.webContents.openDevTools();
}

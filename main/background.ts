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

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarOverlay: true,
    autoHideMenuBar: true,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url); // Open URL in user's browser.
    return { action: "deny" }; // Prevent the app from opening the URL.
  });
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('getBuildNumber', async (event) => {
  const core = new ov.Core();
  const device = 'CPU';
  const v = core.getVersions(device);

  event.reply('setBuildNumber', v[device].buildNumber);
});

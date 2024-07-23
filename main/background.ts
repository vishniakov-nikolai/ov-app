import path from 'path';
import {
  app,
  HandlerDetails,
  ipcMain,
  shell,
  WindowOpenHandlerResponse,
} from 'electron';
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

ipcMain.on('app.openSample', async (event, sample) => {
  await createSampleWindow();
});

let mainWindow;

main();

async function main() {
  await app.whenReady();

  mainWindow = createWindow('main', {
    width: 650,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarOverlay: true,
    autoHideMenuBar: true,
    maximizable: false,
  });

  await loadWindowURL(mainWindow, 'home');

  mainWindow.webContents.setWindowOpenHandler(openLinkInBrowserHandler);
}

async function createSampleWindow() {
  mainWindow.hide();

  const sampleWindow = createWindow('sampleWindow', {
    width: 850,
    height: 600,
    modal: true,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarOverlay: true,
    autoHideMenuBar: true,
  });

  await loadWindowURL(sampleWindow, 'semantic-segmentation');

  sampleWindow.webContents.setWindowOpenHandler(openLinkInBrowserHandler);

  // FIXME: Doesn't call for some reason
  sampleWindow.once('ready-to-show', () => {
    sampleWindow.show();
  });

  sampleWindow.on('close', () => { mainWindow.show(); });
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

function openLinkInBrowserHandler(details: HandlerDetails) {
  shell.openExternal(details.url); // Open URL in user's browser.

  return { action: 'deny' } as WindowOpenHandlerResponse; // Prevent the app from opening the URL.
}

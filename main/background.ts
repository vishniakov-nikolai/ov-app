import path from 'path';
import {
  app,
  net,
  dialog,
  HandlerDetails,
  ipcMain,
  shell,
  WindowOpenHandlerResponse,
  protocol,
} from 'electron';
import serve from 'electron-serve';
import url from 'node:url';
import { createWindow, downloadFile } from './helpers';
import { addon as ov } from 'openvino-node';
import { runInference } from './ov-jobs';

const isProd = process.env.NODE_ENV === 'production';
const userDataPath = app.getPath('userData');

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

ipcMain.on('app.start.selectImage', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }],
  });

  event.reply('app.end.selectImage', result.canceled ? null : result.filePaths[0]);
});

ipcMain.on('app.start.downloadSegmentationModel', async (event) => {
  console.log('== app.start.downloadSegmentationModel');

  const modelName = 'road-segmentation-adas-0001';
  const modelXMLName = `${modelName}.xml`;
  const modelBINName = `${modelName}.bin`;
  const baseURL = 'https://storage.openvinotoolkit.org/repositories/open_model_zoo/2022.3/models_bin/1/road-segmentation-adas-0001/FP32/';

  const xmlPath = await downloadFile(baseURL + modelXMLName, modelXMLName, userDataPath);
  const binPath = await downloadFile(baseURL + modelBINName, modelBINName, userDataPath);

  event.reply('app.end.downloadSegmentationModel', { xmlPath, binPath });
});

ipcMain.on('ov.start.ssd.runInference', async (event, imgPath: string) => {
  event.reply('ov.start.ssd.runInference');
  console.log('== ov.start.ssd.runInference', imgPath);

  const resultPath = await runInference(imgPath, userDataPath);

  console.log(resultPath);

  event.reply('ov.end.ssd.runInference', resultPath);
});

let mainWindow;

main();

async function main() {
  await app.whenReady();

  protocol.handle('atom', (request) => {
    const filePath = request.url.slice('atom://'.length);

    return net.fetch(url.pathToFileURL(path.join(__dirname, filePath)).toString());
  });

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
      webSecurity: false,
    },
    titleBarOverlay: true,
    autoHideMenuBar: true,
  });

  await loadWindowURL(sampleWindow, 'semantic-segmentation');

  sampleWindow.webContents.setWindowOpenHandler(openLinkInBrowserHandler);

  // FIXME: Doesn't call for some reason
  // sampleWindow.once('ready-to-show', () => {
  //   sampleWindow.show();
  // });

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

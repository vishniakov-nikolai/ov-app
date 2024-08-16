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
import { createWindow, downloadFile, isFileExists } from './helpers';
import { addon as ov } from 'openvino-node';
import { runSSDInference } from './ov-jobs';
import { BE, UI } from '../constants';
import getPredefinedModelConfig from './predefined-models';

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

ipcMain.on(BE.GET.OV.VERSION, async (event) => {
  const core = new ov.Core();
  const device = 'CPU';
  const v = core.getVersions(device);

  event.reply(UI.SET.OV.VERSION, v);
});

ipcMain.on(BE.GET.OV.AVAILABLE_DEVICES, async (event) => {
  const core = new ov.Core();
  const devices = core.getAvailableDevices();

  event.reply(UI.SET.OV.AVAILABLE_DEVICES, devices);
});

ipcMain.on(BE.OPEN_SAMPLE, async (event, sample) => {
  await createSampleWindow();
});

ipcMain.on(BE.START.OV.SELECT_IMG, async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }],
  });

  event.reply(UI.END.SELECT_IMG, result.canceled ? null : result.filePaths[0]);
});

ipcMain.on(BE.START.DOWNLOAD_SEGMENTATION_MODEL, async (event, modelLabel) => {
  console.log(`== ${BE.START.DOWNLOAD_SEGMENTATION_MODEL}: ${modelLabel}`);

  const { url, files } = getPredefinedModelConfig(modelLabel);
  const paths = [];

  for (const filename of files) {
    let filePath = path.join(userDataPath, filename);

    if (await isFileExists(filePath)) continue;

    await downloadFile(url + filename, filename, userDataPath);
    paths.push(filePath);
  }

  event.reply(UI.END.DOWNLOAD_SEGMENTATION_MODEL, paths);
});

ipcMain.on(BE.START.OV.SSD_INFERENCE, async (event, {
  modelLabel,
  imgPath,
  device,
}) => {
  event.reply(UI.START.SSD_INFERENCE);
  console.log(`== ${UI.START.SSD_INFERENCE}`, imgPath);

  const inferenceResult = await runSSDInference({
    modelLabel,
    imgPath,
    device,
    destPath: userDataPath,
  });
  event.reply(UI.END.SSD_INFERENCE, inferenceResult);
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
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarOverlay: true,
    autoHideMenuBar: true,
    maximizable: false,
  });
  mainWindow.setResizable(false);

  await loadWindowURL(mainWindow, 'home');

  mainWindow.webContents.setWindowOpenHandler(openLinkInBrowserHandler);
}

async function createSampleWindow() {
  mainWindow.hide();

  const sampleWindow = createWindow('sampleWindow', {
    width: 900,
    height: 750,
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

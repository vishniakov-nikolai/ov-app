import path from 'path';
import fs from 'node:fs/promises';
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
import { addon as ov } from 'openvino-node';

import { createWindow } from './helpers';
import { BE, UI } from '../constants';
import InferenceHandlerSingleton from './lib/inference-handler';
import { PredefinedModel } from './lib';
import { PredefinedModelConfig } from '../globals/types';

const isProd = process.env.NODE_ENV === 'production';
const userDataPath = app.getPath('userData');
const MODEL_CONFIG_PATH = './predefined-models.json';

let lastInferenceTime: BigInt = 0n;

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

ipcMain.on(BE.START.LOAD_MODELS_LIST, async (event) => {
  let modelsConfig = [];

  try {
    modelsConfig = await getModelsConfig();
  } catch(e) {
    console.log(e.message);
  }

  event.reply(UI.END.LOAD_MODELS_LIST, modelsConfig);
});

ipcMain.on(BE.OPEN_MODEL, async (event, modelName) => {
  let modelsConfig: PredefinedModelConfig[] = [];

  try {
    modelsConfig = await getModelsConfig();
  } catch(e) {
    console.log(e.message);
    return;
  }

  const config = modelsConfig.find(m => m.name === modelName);

  await createModelWindow(new PredefinedModel(config));
});

ipcMain.on(BE.START.OV.SELECT_IMG, async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }],
  });

  event.reply(UI.END.SELECT_IMG, result.canceled ? null : result.filePaths[0]);
});

type InitModelParams = { modelName: string, device: string };
ipcMain.on(BE.START.INIT_MODEL, async (event, params: InitModelParams) => {
  console.log(`== INIT_MODEL: ${params.modelName}, device = '${params.device}'`);
  const { modelName, device } = params;
  const modelConfigs = await getModelsConfig();
  const config = modelConfigs.find(m => m.name === modelName);

  if (!config) throw new Error(`Model '${modelName}' is not found`);

  console.log('== start init');
  await InferenceHandlerSingleton.init(config, device,
    (nanosec) => { lastInferenceTime = nanosec; });
  console.log('== end init');

  event.reply(UI.END.INIT_MODEL, []);
});

ipcMain.on(BE.START.OV.INFERENCE, async (event, {
  modelLabel,
  imgPath,
  device,
}) => {
  event.reply(UI.START.INFERENCE);
  console.log(`== ${UI.START.INFERENCE}`, imgPath);

  const generator = InferenceHandlerSingleton.get();

  try {
    console.log('== start inference');
    const output = await generator(imgPath, { topk: 5 });
    console.log('== end inference');
    event.reply(UI.END.INFERENCE, { data: output, elapsedTime: lastInferenceTime });

  } catch(e) {
    event.reply(UI.EXCEPTION, e.message);
  }
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
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarOverlay: true,
    autoHideMenuBar: true,
    // maximizable: false,
  });
  // mainWindow.setResizable(false);

  await loadWindowURL(mainWindow, 'home');

  mainWindow.webContents.setWindowOpenHandler(openLinkInBrowserHandler);


  function inferenceCallback(nanosec) {
    console.log(`=== Inference time: ${formatNanoseconds(nanosec)}ms`)
  }

  function formatNanoseconds(bigNumber) {
    return Math.floor(Number(bigNumber) / 1000000);
  }
}

async function createModelWindow(modelConfig: PredefinedModel) {
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

  await loadWindowURL(sampleWindow, `${modelConfig.task}?model=${modelConfig.name}`);

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

async function sleep(time) {
  return new Promise((res, rej) => setTimeout(() => {
    res(true);
  }, time));
}

async function getModelsConfig(): Promise<PredefinedModelConfig[]> {
  const modelsConfigData = await fs.readFile(MODEL_CONFIG_PATH, 'utf-8');
  const modelsConfig = JSON.parse(modelsConfigData);

  modelsConfig.forEach(c => {
    if (!PredefinedModel.isValid(c))
      throw new Error(`Model config is invalid: ${JSON.stringify(c)}`);
  });

  return modelsConfig;
}

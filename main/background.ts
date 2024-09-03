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
import { addon as ov } from 'openvino-node';

import { createWindow } from './helpers';
import { BE, UI } from '../constants';
import InferenceHandlerSingleton from './lib/inference-handler';
import { getApplicationModels, ModelConfig } from './lib';
import { IModelConfig } from '../globals/types';

const isProd = process.env.NODE_ENV === 'production';
const ApplicationModelsSingleton = getApplicationModels();

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
  const applicationModels = await ApplicationModelsSingleton.get();

  event.reply(UI.END.LOAD_MODELS_LIST, applicationModels.models);
});

ipcMain.on(BE.OPEN_MODEL, async (event, modelName) => {
  const applicationModels = await ApplicationModelsSingleton.get();

  await createModelWindow(applicationModels.get(modelName));
});

ipcMain.on(BE.START.OV.SELECT_IMG, async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }],
  });

  event.reply(UI.END.SELECT_IMG, result.canceled ? null : result.filePaths[0]);
});

type IModelConfigData = { name: string, task: string, files: string };
ipcMain.on(BE.START.SAVE_MODEL, async (event, modelConfigData: IModelConfigData) => {
  const applicationModels = await ApplicationModelsSingleton.get();
  const model: IModelConfig = {
    name: modelConfigData.name,
    task: modelConfigData.task,
    files: modelConfigData.files.split(','),
  };

  try {
    applicationModels.add(model);
  } catch(e) {
    console.log(e.message);
    return;
  }

  event.reply(UI.END.SAVE_MODEL, applicationModels.models);
});

ipcMain.on(BE.START.REMOVE_MODEL, async (event, { name }: { name: string }) => {
  const applicationModels = await ApplicationModelsSingleton.get();

  try {
    applicationModels.remove(name);
  } catch(e) {
    console.log(e.message);
    return;
  }

  event.reply(UI.END.SAVE_MODEL, applicationModels.models);
});

type InitModelParams = { modelName: string, device: string };
ipcMain.on(BE.START.INIT_MODEL, async (event, params: InitModelParams) => {
  console.log(`== INIT_MODEL: ${params.modelName}, device = '${params.device}'`);
  const { modelName, device } = params;
  const config = (await ApplicationModelsSingleton.get()).get(modelName);

  if (!config) throw new Error(`Model '${modelName}' is not found`);

  console.log('== start init');
  await InferenceHandlerSingleton.init(config, device,
    (nanosec) => { lastInferenceTime = nanosec; });
  console.log('== end init');

  event.reply(UI.END.INIT_MODEL, []);
});

ipcMain.on(BE.START.OV.INFERENCE, async (event, { value, config }) => {
  event.reply(UI.START.INFERENCE);
  console.log(`== ${UI.START.INFERENCE}`, value);

  const generator = InferenceHandlerSingleton.get();
  const generationConfig = typeof value === 'string'
    ? {
        ...config,
        'callback_function': x => {
          const txt = generator.tokenizer.decode(x[0]['output_token_ids']);

          console.log(txt);

          event.reply(UI.START.NEW_CHUNK, txt);
        }
      }
    : config;

  try {
    console.log('== start inference');
    const output = await generator(value, generationConfig);
    console.log(config);
    console.log('== end inference');
    event.reply(UI.END.INFERENCE, { data: output, elapsedTime: lastInferenceTime });
  } catch(e) {
    event.reply(UI.EXCEPTION, e.message);
    console.log(e);
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
}

async function createModelWindow(modelConfig: ModelConfig) {
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

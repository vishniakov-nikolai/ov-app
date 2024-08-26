import path from 'node:path';

import { app } from 'electron';

import {
  preprocessImageToTensor,
  preprocessSelfieMulticlassInput,
} from './preprocessors';
import {
  postprocessClassificationOutput,
  postprocessSegmentationOutput,
} from './postprocessors';
import { downloadFile, isFileExists } from './helpers';

import type { IPreprocess } from './preprocessors';
import type { IPostprocess } from './postprocessors';

const userDataPath = app.getPath('userData');
const MODEL_DIR = userDataPath;

type Task = 'classification' | 'ssd';

interface IModelConfig {
  name: string,
  task: Task,
  preprocess: IPreprocess,
  postprocess: IPostprocess,
  url: string,
  files: string[],
  assetsUrls?: string[],
  inputLayout?: string,
  outputLayout?: string,
};

const predefinedModels: IModelConfig[] = [
  {
    name: 'road-segmentation-adas-0001',
    task: 'ssd',
    url: 'https://storage.openvinotoolkit.org/repositories/open_model_zoo/2022.3/models_bin/1/road-segmentation-adas-0001/FP32/',
    files: [
      'road-segmentation-adas-0001.xml',
      'road-segmentation-adas-0001.bin'
    ],
    inputLayout: 'NCHW',
    outputLayout: 'NCHW',
    preprocess: preprocessImageToTensor,
    postprocess: postprocessSegmentationOutput,
  },
  {
    name: 'selfie-multiclass',
    task: 'ssd',
    url: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/',
    files: [
      'selfie_multiclass_256x256.tflite',
    ],
    inputLayout: 'NHWC',
    outputLayout: 'NHWC',
    preprocess: preprocessSelfieMulticlassInput,
    postprocess: postprocessSegmentationOutput,
  },
  {
    name: 'v3-small_224_1.0_float',
    task: 'classification',
    url: 'https://storage.openvinotoolkit.org/repositories/openvino_notebooks/models/mobelinet-v3-tf/FP32/',
    files: [
      'v3-small_224_1.0_float.xml',
      'v3-small_224_1.0_float.bin',
    ],
    assetsUrls: ['https://storage.openvinotoolkit.org/repositories/openvino_notebooks/data/data/datasets/imagenet/imagenet_class_index.json'],
    inputLayout: 'NHWC',
    preprocess: preprocessImageToTensor,
    postprocess: postprocessClassificationOutput,
  },
];

class File {
  static getPath(filename) {
    const predefinedModelsPath = MODEL_DIR;

    return path.join(predefinedModelsPath, filename);
  }

  static getFilename(url) {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const filename = path.basename(pathname);

    return filename;
  }

  static getPathByUrl(url) {
    const filename = File.getFilename(url);

    return File.getPath(filename);
  }
}

export default class ModelConfig implements IModelConfig {
  originalConfig: IModelConfig;

  name: string;
  task: Task;
  preprocess: IPreprocess;
  postprocess: IPostprocess;
  url: string;
  files: string[];
  assetsUrls?: string[];
  inputLayout?: string;
  outputLayout?: string;

  constructor(originalConfig: IModelConfig) {
    Object.assign(this, originalConfig);
  }

  async downloadModelFiles() {
    for (const filename of this.files) {
      const filePath = File.getPath(filename);

      if (await isFileExists(filePath)) continue;

      await downloadFile(this.url + filename, filename, userDataPath);
    }
  }

  async downloadAssetsFiles() {
    if (!this.assetsUrls?.length) return;

    for (const url of this.assetsUrls) {
      const filename = File.getFilename(url);
      const filePath = File.getPath(filename);

      if (await isFileExists(filePath)) continue;

      await downloadFile(url, filename, userDataPath);
    }
  }

  get filesPaths() {
    return this.files.map(f => File.getPath(f));
  }

  get assetsPaths() {
    return (this.assetsUrls || []).map(u => File.getPathByUrl(u));
  }

  static get(label: string) {
    const modelConfig = predefinedModels.find(m => m.name === label);

    if (!modelConfig)
      throw new Error(`Predefined model with label '${label}' not found`);

    return new ModelConfig(modelConfig);
  }
}

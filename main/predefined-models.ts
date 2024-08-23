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
  config: {
    inputLayout?: string,
    outputLayout?: string,
  }
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
    config: {
      inputLayout: 'NCHW',
      outputLayout: 'NCHW',
    },
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
    config: {
      inputLayout: 'NHWC',
      outputLayout: 'NHWC',
    },
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
    config: {
      inputLayout: 'NHWC',
    },
    preprocess: preprocessImageToTensor,
    postprocess: postprocessClassificationOutput,
  },
];

export default function getPredefinedModelConfig(label) {
  const predefinedModelsPath = MODEL_DIR;
  const modelConfig = predefinedModels.find(m => m.name === label);

  if (!modelConfig)
    throw new Error(`Predefined model with label '${label}' not found`);

  return {
    ...modelConfig,
    paths: modelConfig.files.map(filename => path.join(predefinedModelsPath, filename)),
  }
}

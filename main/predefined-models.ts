import path from 'node:path';

import { app } from 'electron';
import type { Tensor } from 'openvino-node';

import {
  preprocessRoadSegInput,
  preprocessSelfieMulticlassInput,
} from './preprocessors';
import { postprocessSegmentationOutput } from './postprocessors';
import { InferenceHandler } from './lib';

const userDataPath = app.getPath('userData');
const MODEL_DIR = userDataPath;

type Task = 'classification' | 'ssd';

interface IModelConfig {
  name: string,
  task: Task,
  preprocess: (ih: InferenceHandler, imgPath: string, config?: Object) => Promise<{
    input: { [inputName: string]: Tensor },
    preprocessData?: Object,
  }>,
  postprocess: (
    output: { [outputName: string]: Tensor },
    inputImgPath: string,
    // FIXME: Change that. Not all models has image as result.
    resultImagePath: string,
    config: Object,
    preprocessData: Object,
  ) => Promise<{ outputPath }>, // FIXME: Also needs to be refactored
  url: string,
  files: string[],
  config: {
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
      outputLayout: 'NCHW',
    },
    preprocess: preprocessRoadSegInput,
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
      outputLayout: '',
    },
    preprocess: preprocessSelfieMulticlassInput,
    postprocess: postprocessSegmentationOutput,
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

import path from 'node:path';
import { app } from 'electron';

import {
  preprocessRoadSegInput,
  preprocessSelfieMulticlassInput,
} from './preprocessors';
import { postprocessRoadSegInput } from './postprocessors';

const userDataPath = app.getPath('userData');
const MODEL_DIR = userDataPath;

const predefinedModelsMapping = {
  'road-segmentation-adas-0001': {
    preprocess: preprocessRoadSegInput,
    postprocess: postprocessRoadSegInput,
    url: 'https://storage.openvinotoolkit.org/repositories/open_model_zoo/2022.3/models_bin/1/road-segmentation-adas-0001/FP32/',
    files: [
      'road-segmentation-adas-0001.xml',
      'road-segmentation-adas-0001.bin'
    ],
    config: {
      outputLayout: 'NCHW',
    },
  },
  'selfie-multiclass': {
    preprocess: preprocessSelfieMulticlassInput,
    postprocess: postprocessRoadSegInput,
    url: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/',
    files: [
      'selfie_multiclass_256x256.tflite',
    ],
    config: {
      outputLayout: 'NHWC',
    },
  },
};

export default function getPredefinedModelConfig(label) {
  const predefinedModelsPath = MODEL_DIR;
  const modelConfig = predefinedModelsMapping[label];

  if (!modelConfig)
    throw new Error(`Predefined model with label '${label}' not found`);

  return {
    ...modelConfig,
    paths: modelConfig.files.map(filename => path.join(predefinedModelsPath, filename)),
  }
}

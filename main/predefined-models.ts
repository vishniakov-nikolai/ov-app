import path from 'node:path';
import { app } from 'electron';

import { preprocessSSDInput } from './preprocessors';
import { postprocessSSDInput } from './postprocessors';

const userDataPath = app.getPath('userData');
const MODEL_DIR = userDataPath;

const predefinedModelsMapping = {
  'road-segmentation-adas-0001': {
    preprocess: preprocessSSDInput,
    postprocess: postprocessSSDInput,
    url: 'https://storage.openvinotoolkit.org/repositories/open_model_zoo/2022.3/models_bin/1/road-segmentation-adas-0001/FP32/',
    files: [
      'road-segmentation-adas-0001.xml',
      'road-segmentation-adas-0001.bin'
    ],
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

import path from 'node:path';
import { app } from 'electron';

import { preprocessSSDInput } from './preprocessors';
import { postprocessSSDInput } from './postprocessors';
import InferenceHandlerSingleton from './inference-handler';

const userDataPath = app.getPath('userData');
const MODEL_DIR = userDataPath;

const predefinedModelsMapping = {
  'road-segmentation-adas-0001': {
    preprocess: preprocessSSDInput,
    postprocess: postprocessSSDInput,
    files: [
      'road-segmentation-adas-0001.xml',
      'road-segmentation-adas-0001.bin'
    ],
  },
};

function getPredefinedModelConfig(label) {
  const predefinedModelsPath = MODEL_DIR;
  const modelConfig = predefinedModelsMapping[label];

  if (!modelConfig)
    throw new Error(`Predefined model with label '${label}' not found`);

  return {
    ...modelConfig,
    files: modelConfig.files.map(filename => path.join(predefinedModelsPath, filename)),
  }
}

export async function runSSDInference({
  modelLabel,
  imgPath,
  device,
  destPath,
}) {
  console.log(`Start inference of image: ${imgPath}, device ${device}`);

  const { files, preprocess, postprocess } = getPredefinedModelConfig(modelLabel);
  const ih = await InferenceHandlerSingleton.get(...files);
  const input = await preprocess(imgPath, ih);
  const {
    inferenceResult,
    elapsedTime,
  } = await ih.performInference(input, device);
  const postprocessResult = await postprocess(inferenceResult, imgPath, destPath);

  return {
    ...postprocessResult,
    elapsedTime,
  };
}

import getPredefinedModelConfig from './predefined-models';
import InferenceHandlerSingleton from './inference-handler';

export async function runSSDInference({
  modelLabel,
  imgPath,
  device,
  destPath,
}) {
  console.log(`Start inference of image: ${imgPath}, device ${device}`);

  const { paths, preprocess, postprocess } = getPredefinedModelConfig(modelLabel);
  const ih = await InferenceHandlerSingleton.get(...paths);
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

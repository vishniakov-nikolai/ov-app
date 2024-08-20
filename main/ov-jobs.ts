import getPredefinedModelConfig from './predefined-models';
import InferenceHandlerSingleton from './inference-handler';

export async function runSSDInference({
  modelLabel,
  imgPath,
  device,
  destPath,
}) {
  console.log(`Start inference of image: ${imgPath}, device ${device} using model ${modelLabel}`);

  const {
    paths,
    preprocess,
    postprocess,
    config,
  } = getPredefinedModelConfig(modelLabel);

  const ih = await InferenceHandlerSingleton.get(...paths);
  const { input, preprocessData } = await preprocess(imgPath, ih, config);

  try {
    const {
      inferenceResult,
      elapsedTime,
    } = await ih.performInference(input, device);
    console.log({ inferenceResult });
    const postprocessResult = await postprocess(
      inferenceResult,
      imgPath,
      destPath,
      config,
      preprocessData,
    );

    return {
      ...postprocessResult,
      elapsedTime,
    };
  } catch(e) {
    console.log(`Something went wrong. Error message: ${e.message}`);
  }
}

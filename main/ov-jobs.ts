// import ModelConfig from './predefined-models';
import { InferenceHandlerSingleton } from './lib';

export async function runSSDInference({
  modelLabel,
  imgPath,
  device,
  destPath,
}) {
  console.log(`Start inference of image: ${imgPath}, device ${device} using model ${modelLabel}`);

  // const modelConfig = ModelConfig.get(modelLabel);
  // const { filesPaths, preprocess, postprocess } = modelConfig;
  // const ih = await InferenceHandlerSingleton.get(...filesPaths);
  // const { input, preprocessData } = await preprocess(ih, modelConfig, imgPath);

  // try {
  //   const {
  //     inferenceResult,
  //     elapsedTime,
  //   } = await ih.performInference(input, device);
  //   console.log({ inferenceResult });
  //   const postprocessResult = await postprocess(
  //     modelConfig,
  //     inferenceResult,
  //     imgPath,
  //     destPath,
  //     preprocessData,
  //   );

  //   return {
  //     ...postprocessResult,
  //     elapsedTime,
  //   };
  // } catch(e) {
  //   console.log(`Something went wrong. Error message: ${e.message}`);
  //   console.log(e);
  // }
}

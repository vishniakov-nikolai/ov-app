// const fs = require('node:fs').promises;

// // const { cv } = require('opencv-wasm');

// import {
//   getImageData,
//   arrayToImageData,
//   getImageBuffer,
// }  from './helpers/ov-helpers';
// import { LayoutObj } from './lib';

// import type { Tensor, SupportedTypedArray } from 'openvino-node';
// import ModelConfig from './predefined-models';

// export type IPostprocess = (
//   modelConfig: ModelConfig,
//   output: { [outputName: string]: Tensor },
//   inputImgPath: string,
//   // FIXME: Change that. Not all models has image as result.
//   resultImagePath: string,
//   preprocessData: Object,
// ) => Promise<{
//   outputPath?: string,
//   data?: number[] | { prediction: number, classId: number }[],
// }>; // FIXME: Also needs to be refactored

// export { postprocessClassificationOutput, postprocessSegmentationOutput };

// const postprocessClassificationOutput: IPostprocess = async function(
//   modelConfig,
//   outputTensorsObj,
//   imgPath,
//   destPath,
//   preprocessData,
// ) {
//   const MAX_DISPLAY_CLASSES = 5;
//   const outputTensor = Object.values(outputTensorsObj)[0];

//   const predictions = Array.from(outputTensor.data)
//     .map((prediction, classId) => ({ prediction, classId }))
//     .sort(({ prediction: predictionA }, { prediction: predictionB }) =>
//       predictionA === predictionB ? 0 : predictionA > predictionB ? -1 : 1);

//   const dictionaryPath = modelConfig.assetsPaths[0];
//   const dictionaryContent = await fs.readFile(dictionaryPath, 'utf-8');
//   const dictionary = JSON.parse(dictionaryContent);

//   return {
//     data: predictions.slice(0, MAX_DISPLAY_CLASSES),
//     dictionary,
//   };
// }

// const postprocessSegmentationOutput: IPostprocess = async function(
//   modelConfig,
//   outputTensorsObj,
//   imgPath,
//   destPath,
//   preprocessData,
// ) {
//   const outputTensor = Object.values(outputTensorsObj)[0];
//   // Put output data at input image
//   const imgDataWithOutput = await placeTensorDataOnImg(imgPath, outputTensor, modelConfig.outputLayout, preprocessData);

//   // Save result on disk
//   const filename = `out-${new Date().getTime()}.jpg`;
//   const fullPath = `${destPath}/${filename}`;

//   await saveArrayDataAsFile(fullPath, imgDataWithOutput);
//   console.log(`Output image saved as: ${fullPath}`);

//   return { outputPath: fullPath };
// }

// async function saveArrayDataAsFile(path, arrayData) {
//   await fs.writeFile(path, getImageBuffer(arrayData));
// }

// async function placeTensorDataOnImg(
//   imgPath: string,
//   tensor: Tensor,
//   layoutStr: string,
//   preprocessData: { padInfo?: { bottomPadding, rightPadding } },
// ) {
//   const layout = new LayoutObj(layoutStr, tensor.getShape());
//   const imgData = await getImageData(imgPath);
//   const originalImage = cv.matFromImageData(imgData);
//   const { cols: originalWidth, rows: originalHeight } = originalImage;
//   const inferenceResultLayer = getTopProbabilities(tensor.data, layout);
//   const colormap = [
//     [255, 99, 71, 255],   // Tomato
//     [135, 206, 235, 255], // Sky Blue
//     [255, 215, 0, 255],   // Gold
//     [144, 238, 144, 255], // Light Green
//     [255, 105, 180, 255], // Hot Pink
//     [72, 61, 139, 255],   // Dark Slate Blue
//     [255, 140, 0, 255],   // Dark Orange
//     [75, 0, 130, 255],    // Indigo
//     [240, 230, 140, 255], // Khaki
//     [0, 206, 209, 255],   // Dark Turquoise
//     [138, 43, 226, 255],  // Blue Violet
//     [60, 179, 113, 255],  // Medium Sea Green
//   ];

//   const pixels = [];
//   inferenceResultLayer.map(i => pixels.push(...colormap[i]));

//   const alpha = 0.6;
//   const H = layout.get('H');
//   const W = layout.get('W');
//   const pixelsAsImageData = arrayToImageData(pixels, W, H);
//   let mask = cv.matFromImageData(pixelsAsImageData);

//   if (preprocessData?.padInfo) {
//     const { bottomPadding, rightPadding } = preprocessData.padInfo;

//     let rect = new cv.Rect(0, 0, W - rightPadding, H - bottomPadding);
//     mask = mask.roi(rect);
//   }

//   cv.resize(mask, mask, new cv.Size(originalWidth, originalHeight));
//   cv.addWeighted(mask, alpha, originalImage, 1 - alpha, 0, mask);

//   return arrayToImageData(mask.data, originalWidth, originalHeight);
// }

// function getTopProbabilities(data: SupportedTypedArray, layout: LayoutObj) {
//   const numberOfLayers = layout.get('C');
//   const size = data.length / numberOfLayers;

//   const chwValueAt = (idx: number, position: number) =>
//     data[idx + position * size];
//   const hwcValueAt = (idx: number, position: number) =>
//     data[idx * numberOfLayers + position];

//   let fn;

//   if (layout.layoutStr === 'NCHW') fn = chwValueAt;
//   if (layout.layoutStr === 'NHWC') fn = hwcValueAt;

//   const getComponents = idx => Array(numberOfLayers).fill(0).map((_, p) => fn(idx, p));

//   return Array(size).fill(0).map((_, i) => {
//     const components = getComponents(i);

//     return components.indexOf(Math.max(...components));
//   });
// }

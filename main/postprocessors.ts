const fs = require('node:fs').promises;

const { cv } = require('opencv-wasm');

import {
  getImageData,
  arrayToImageData,
  getImageBuffer,
}  from './helpers/ov-helpers';

export async function postprocessSSDInput(outputTensorsObj, imgPath, destPath) {
  const outputTensor = Object.values(outputTensorsObj)[0] as { data: Float32Array };
  // Put output data at input image
  const imgDataWithOutput = await placeTensorDataOnImg(imgPath, outputTensor);

  // Save result on disk
  const filename = `out-${new Date().getTime()}.jpg`;
  const fullPath = `${destPath}/${filename}`;

  await saveArrayDataAsFile(fullPath, imgDataWithOutput);
  console.log(`Output image saved as: ${fullPath}`);

  return { outputPath: fullPath };
}

async function saveArrayDataAsFile(path, arrayData) {
  await fs.writeFile(path, getImageBuffer(arrayData));
}

async function placeTensorDataOnImg(imgPath, tensor) {
  const imgData = await getImageData(imgPath);

  const originalImage = cv.matFromImageData(imgData);
  const { cols: originalWidth, rows: originalHeight } = originalImage;

  const { data: outputData } = tensor;
  const inferenceResultLayer = [];
  const colormap = [
    [255, 99, 71, 255],   // Tomato
    [135, 206, 235, 255], // Sky Blue
    [255, 215, 0, 255],   // Gold
    [144, 238, 144, 255], // Light Green
    [255, 105, 180, 255], // Hot Pink
    [72, 61, 139, 255],   // Dark Slate Blue
    [255, 140, 0, 255],   // Dark Orange
    [75, 0, 130, 255],    // Indigo
    [240, 230, 140, 255], // Khaki
    [0, 206, 209, 255],   // Dark Turquoise
    [138, 43, 226, 255],  // Blue Violet
    [60, 179, 113, 255]   // Medium Sea Green
  ];
  const size = outputData.length / 4;

  for (let i = 0; i < size; i++) {
    const valueAt = (i, number) => outputData[i + number * size];

    const currentValues = {
      bg: valueAt(i, 0),
      c: valueAt(i, 1),
      h: valueAt(i, 2),
      w: valueAt(i, 3),
    };
    const values = Object.values(currentValues);
    const maxIndex = values.indexOf(Math.max(...values));

    inferenceResultLayer.push(maxIndex);
  }

  const pixels = [];
  inferenceResultLayer.forEach(i => pixels.push(...colormap[i]));

  const alpha = 0.5;

  const [H, W] = tensor.getShape().slice(2);
  const pixelsAsImageData = arrayToImageData(pixels, W, H);
  const mask = cv.matFromImageData(pixelsAsImageData);

  cv.resize(mask, mask, new cv.Size(originalWidth, originalHeight));
  cv.addWeighted(mask, alpha, originalImage, 1 - alpha, 0, mask);

  return arrayToImageData(mask.data, originalWidth, originalHeight);
}

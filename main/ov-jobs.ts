const fs = require('node:fs').promises;
const path = require('node:path');

const { cv } = require('opencv-wasm');
const { addon: ov } = require('openvino-node');

import { app } from 'electron';

import {
  getImageData,
  arrayToImageData,
  transform,
  getImageBuffer,
}  from './helpers/ov-helpers';
import { hrtime } from 'process';

const userDataPath = app.getPath('userData');
const MODEL_DIR = userDataPath;
const MODEL_NAME = 'road-segmentation-adas-0001.xml';

let globalInferRequest = null;
let globalInputLayer = null;
let previousDevice = null;

async function prepareInferRequest(device = 'AUTO') {
  previousDevice = device;

  const modelXMLPath = path.join(MODEL_DIR, MODEL_NAME);
  const core = new ov.Core();

  const model = await core.readModel(modelXMLPath);
  const compiledModel = await core.compileModel(model, device);
  const inputLayer = compiledModel.input(0);
  const inferRequest = compiledModel.createInferRequest();

  return { inputLayer, inferRequest };
}

export async function runInference(imgPath, device, destPath) {
  console.log(`Start inference of image: ${imgPath}`);

  if (!globalInferRequest || !globalInputLayer || previousDevice !== device) {
    const result = await prepareInferRequest(device);

    globalInferRequest = result.inferRequest;
    globalInputLayer = result.inputLayer;
  }

  const imgDataArray = await getArrayWithImgData(imgPath, globalInputLayer.shape);
  const inputTensor = new ov.Tensor('f32', globalInputLayer.shape, imgDataArray);

  console.time('Inference time');
  const startTime = hrtime.bigint();
  const inferenceResult = await globalInferRequest.inferAsync({ [globalInputLayer.anyName]: inputTensor });
  const endTime = hrtime.bigint();
  console.timeEnd('Inference time');

  const outputTensor = Object.values(inferenceResult)[0];
  const imgDataWithOutput = await placeTensorDataOnImg(imgPath, outputTensor);

  const filename = `out-${new Date().getTime()}.jpg`;
  const fullPath = `${destPath}/${filename}`;

  await saveArrayDataAsFile(fullPath, imgDataWithOutput);
  console.log(`Output image saved as: ${fullPath}`);

  return { outputPath: fullPath, elapsedTime: endTime - startTime };
}

async function saveArrayDataAsFile(path, arrayData) {
  await fs.writeFile(path, getImageBuffer(arrayData));
}

async function getArrayWithImgData(imgPath, shape) {
  const imgData = await getImageData(imgPath);

  const originalImage = cv.matFromImageData(imgData);

  const image = new cv.Mat();
  cv.cvtColor(originalImage, image, cv.COLOR_RGBA2RGB);
  cv.cvtColor(image, image, cv.COLOR_BGR2RGB);

  const [B, C, H, W] = shape;

  cv.resize(image, image, new cv.Size(W, H));

  const inputImage = transform(image.data, { width: W, height: H }, [0, 1, 2]); // NHWC to NCHW

  return new Float32Array(inputImage);
}

async function placeTensorDataOnImg(imgPath, tensor) {
  const imgData = await getImageData(imgPath);

  const originalImage = cv.matFromImageData(imgData);
  const { cols: originalWidth, rows: originalHeight } = originalImage;

  const { data: outputData } = tensor;
  const inferenceResultLayer = [];
  const colormap = [
    [68, 1, 84, 255],
    [48, 103, 141, 255],
    [53, 183, 120, 255],
    [199, 216, 52, 255],
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

  const alpha = 0.4;

  const [H, W] = tensor.getShape().slice(2);
  const pixelsAsImageData = arrayToImageData(pixels, W, H);
  const mask = cv.matFromImageData(pixelsAsImageData);

  cv.resize(mask, mask, new cv.Size(originalWidth, originalHeight));
  cv.addWeighted(mask, alpha, originalImage, 1 - alpha, 0, mask);

  return arrayToImageData(mask.data, originalWidth, originalHeight);
}

const { cv } = require('opencv-wasm');
const { addon: ov } = require('openvino-node');

import { getImageData, transform }  from './helpers/ov-helpers';

export async function preprocessSSDInput(imgPath, ih) {
  const inputs = ih.inputs();
  const inputLayer = inputs[0];
  const imgDataArray = await getArrayWithImgData(imgPath, inputLayer.shape);

  return {
    [inputLayer.anyName]: new ov.Tensor('f32', inputLayer.shape, imgDataArray),
  };
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

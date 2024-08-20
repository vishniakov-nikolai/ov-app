const { cv } = require('opencv-wasm');
const { addon: ov } = require('openvino-node');

import { getImageData, transform }  from './helpers/ov-helpers';

export async function preprocessRoadSegInput(imgPath, ih) {
  const inputs = ih.inputs();
  const inputLayer = inputs[0];
  const imgDataArray = await getArrayWithImgData(imgPath, inputLayer.shape);

  return {
    input: {
      [inputLayer.anyName]: new ov.Tensor('f32', inputLayer.shape, imgDataArray),
    },
  };
}

export async function preprocessSelfieMulticlassInput(imgPath, ih) {
  const inputs = ih.inputs();
  const inputLayer = inputs[0];
  const imgData = await getImageData(imgPath);
  const originalImage = cv.matFromImageData(imgData);
  const { paddedImg, padInfo } = await resizeAndPad(originalImage);

  const arr = new Float32Array(paddedImg.data.length);
  for (let i = 0; i < paddedImg.data.length; i++) arr[i] = paddedImg.data[i]/255;

  return {
    input: {
      [inputLayer.anyName]: new ov.Tensor('f32', inputLayer.shape, arr),
    },
    preprocessData: { padInfo },
  };
}

async function getArrayWithImgData(imgPath, shape) {
  const imgData = await getImageData(imgPath);

  const originalImage = cv.matFromImageData(imgData);

  const image = new cv.Mat();
  cv.cvtColor(originalImage, image, cv.COLOR_RGBA2RGB);
  cv.cvtColor(image, image, cv.COLOR_BGR2RGB);

  const [H, W] = shape.slice(2);

  cv.resize(image, image, new cv.Size(W, H));

  const inputImage = transform(image.data, { width: W, height: H }, [0, 1, 2]); // NHWC to NCHW

  return new Float32Array(inputImage);
}

function resizeAndPad(image, height = 256, width = 256) {
  let h = image.rows;
  let w = image.cols;

  let resizedImg;

  if (h < w) {
    let newHeight = Math.floor(h / (w / width));
    resizedImg = new cv.Mat();
    cv.resize(image, resizedImg, new cv.Size(width, newHeight));
  } else {
    let newWidth = Math.floor(w / (h / height));
    resizedImg = new cv.Mat();
    cv.resize(image, resizedImg, new cv.Size(newWidth, height));
  }

  let rH = resizedImg.rows;
  let rW = resizedImg.cols;
  let rightPadding = width - rW;
  let bottomPadding = height - rH;

  // Padding the image
  let paddedImg = new cv.Mat();
  cv.copyMakeBorder(
    resizedImg,
    paddedImg,
    0,
    bottomPadding,
    0,
    rightPadding,
    cv.BORDER_CONSTANT,
    new cv.Scalar(0, 0, 0, 0)  // Assuming black padding
  );

  // Clean up resized image (we're done with it)
  resizedImg.delete();
  cv.cvtColor(paddedImg, paddedImg, cv.COLOR_RGBA2RGB);

  return { paddedImg, padInfo: { bottomPadding, rightPadding } };
}

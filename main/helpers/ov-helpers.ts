import { cv } from 'opencv-wasm';

import {
  Image,
  ImageData,
  loadImage,
  createCanvas,
} from '@napi-rs/canvas';

export function arrayToImageData(array, width, height) {
  return new ImageData(new Uint8ClampedArray(array), width, height);
}

export function getImageBuffer(imageOrImageData) {
  const canvas = createCanvas(imageOrImageData.width, imageOrImageData.height);
  const ctx = canvas.getContext('2d');

  if (imageOrImageData instanceof Image)
    ctx.drawImage(imageOrImageData, 0, 0);
  else if (imageOrImageData instanceof ImageData)
    ctx.putImageData(imageOrImageData, 0, 0);
  else
    throw Error(`Passed parameters has type '${typeof imageOrImageData}'. `
      + 'It is\'t supported.');

  return canvas.toBuffer('image/jpeg');
}

export async function getImageData(path) {
  const image = await loadImage(path);
  const { width, height } = image;

  const canvas = await createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);

  return ctx.getImageData(0, 0, width, height);
}

export function transform(arr, { width, height }, order) {
  const img = new cv.Mat(height, width, cv.CV_8UC3);

  img.data.set(arr, 0, arr.length);

  const channels = new cv.MatVector();
  cv.split(img, channels);

  const val = order.map(num => [...channels.get(num).data]);

  return [].concat(...val);
}

function sum(array) {
  return array.reduce((acc, val) => acc+val, 0);
}

function mul(array) {
  return array.reduce((acc, val) => acc*val, 1);
}

function setShape(flatArray, shape) {
  if (mul(shape) !== flatArray.length)
    throw new Error('Shape doesn\'t according to array length');

  return createMultidimensionArray(flatArray, shape, 0);
}

function createMultidimensionArray(flatArray, shape, offset) {
  const currentDim = shape[0];
  const remainingShape = shape.slice(1);
  const currentArray = [];

  if (remainingShape.length === 0) {
    for (let i = 0; i < currentDim; i++)
      currentArray.push(flatArray[offset + i]);
  }
  else {
    const innerArrayLength = mul(shape) / currentDim;

    for (let i = 0; i < currentDim; i++) {
      const innerArray = createMultidimensionArray(flatArray, remainingShape,
        offset + i*innerArrayLength);

      currentArray.push(innerArray);
    }
  }

  return currentArray;
}

function extractValues(arrOrVal, collector = []) {
  if (arrOrVal[Symbol.iterator] && arrOrVal.map) {
    arrOrVal.map(v => extractValues(v, collector));
  }
  else {
    collector.push(arrOrVal);
  }

  return collector;
}

function isIterableArray(arr) {
  return arr[Symbol.iterator] && arr.map;
}

function eachInner(arrOrValue, fn) {
  return isIterableArray(arrOrValue)
    ? arrOrValue.map(e => eachInner(e, fn))
    : fn(arrOrValue);
}

function exp(arr) {
  return eachInner(arr, Math.exp);
}

function reshape(arr, newShape) {
  const flat = extractValues(arr);

  return setShape(flat, newShape);
}

function getShape(arr, acc = []) {
  if (isIterableArray(arr)) {
    acc.push(arr.length);
    getShape(arr[0], acc);
  }

  return acc;
}

function matrixMultiplication(matrix1, matrix2) {
  const rows1 = matrix1.length;
  const cols1 = matrix1[0].length;
  const rows2 = matrix2.length;
  const cols2 = matrix2[0].length;

  if (cols1 !== rows2)
    throw new Error('Number of columns in the first matrix must match the '
      + 'number of rows in the second matrix.');

  const result = [];

  for (let i = 0; i < rows1; i++) {
    result[i] = [];

    for (let j = 0; j < cols2; j++) {
      let sum = 0;

      for (let k = 0; k < cols1; k++)
        sum += matrix1[i][k] * matrix2[k][j];

      result[i][j] = sum;
    }
  }

  return result;
}

function findMax(arr) {
  let max = -Infinity;
  let index = -1;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < max) continue;

    max = arr[i];
    index = i;
  }

  return { value: max, index };
}

function argMax(arr) {
  return findMax(arr).index;
}

function triu(matrix, k = 0) {
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const result = [];

  for (let i = 0; i < numRows; i++) {
    result[i] = [];

    for (let j = 0; j < numCols; j++)
      result[i][j] = i <= j - k ? matrix[i][j] : 0;
  }

  return result;
}

function tril(matrix, k = 0) {
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const result = [];

  for (let i = 0; i < numRows; i++) {
    result[i] = [];

    for (let j = 0; j < numCols; j++)
      result[i][j] = i >= j - k ? matrix[i][j] : 0;
  }

  return result;
}

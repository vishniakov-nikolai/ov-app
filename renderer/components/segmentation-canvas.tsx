import { ImgHTMLAttributes, useEffect, useRef, useState } from "react";

import { ISegmentationResult } from "../../globals/types";
import { RawImage } from './image';

const colormap = [
  [255, 99, 71],    // Tomato
  [135, 206, 235],  // Sky Blue
  [255, 215, 0],    // Gold
  [144, 238, 144],  // Light Green
  [255, 105, 180],  // Hot Pink
  [72, 61, 139],    // Dark Slate Blue
  [255, 140, 0],    // Dark Orange
  [75, 0, 130],     // Indigo
  [240, 230, 140],  // Khaki
  [0, 206, 209],    // Dark Turquoise
  [138, 43, 226],   // Blue Violet
  [60, 179, 113],   // Medium Sea Green
  [255, 69, 0],     // Red-Orange
  [0, 100, 0],      // Dark Green
  [0, 191, 255],    // Deep Sky Blue
  [255, 20, 147],   // Deep Pink
  [255, 165, 0],    // Orange
  [154, 205, 50],   // Yellow Green
  [0, 0, 128],      // Navy
  [255, 192, 203],  // Pink
];

type ISegmentationCanvas = {
  data: ISegmentationResult[],
  img: React.MutableRefObject<HTMLImageElement>,
};
export function SegmentationCanvas({ data, img }: ISegmentationCanvas) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const listRef = useRef(null);

  const [isCanvasVisible, setIsCanvasVisible] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [selected, setSelected] = useState<string>(null);
  const [currentClass, setCurrentClass] = useState(null);

  // const draw = ctx => {
  //   canvasRef.current.width = containerSize.width;
  //   canvasRef.current.height = containerSize.height;

  //   ctx.fillStyle = '#000000'
  //   ctx.fillStyle = "blue";
  //   ctx.fillRect(0, 0, 200, 100);
  // }

  // useEffect(() => {
  //   const width = data[0]?.mask?.width;
  //   const height = data[0]?.mask?.height;

  //   if (!width || !height) return;

  //   setOriginalSize({ width, height });
  // }, [originalSize]);

  useEffect(() => {
    //Our draw come here
    render();
  }, [render, currentClass]);
  // const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let timer = null;

    const getDimensions = () => ({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight
    })

    const handleResize = () => {
      clearInterval(timer);
      setIsCanvasVisible(false);
      setContainerSize(getDimensions());
      timer = setTimeout(() => setIsCanvasVisible(true), 100)
    }

    if (containerRef.current) {
      setContainerSize(getDimensions());
    }

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    }
  }, [containerRef]);

  useEffect(() => {
    if (!isCanvasVisible) return;

    console.log('== render');
    render();
  }, [isCanvasVisible]);

  function render() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!data.length) return;

    const first = data[0].mask;
    const { width, height } = scale(containerSize, { width: first.width, height: first.height });

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img.current, 0, 0, width, height);

    const regionsData = new Uint8ClampedArray(first.data.length*4);
    const colormap = getColormap(0.5);
    data.forEach((e, idx) => {
      let pixel = colormap[idx];
      const current = e.mask.data;

      if (currentClass === e.label) pixel = [...pixel.slice(0, 3), 255];

      for (let i = 0, offset = 0; i < current.length; i ++) {
        if (current[i] === 0) {
          offset +=4;

          continue;
        }

        regionsData[offset++] = pixel[0];
        regionsData[offset++] = pixel[1];
        regionsData[offset++] = pixel[2];
        regionsData[offset++] = pixel[3];
      }
    });
    // data.slice(0, 1).forEach((e, idx) => {
    //   const pixel = colormap[idx];

    //   for (let i = 0; i < regionsData.length; i += 4) {
    //     if (e.mask.data[i/4] === 255) continue;

    //     regionsData[i] = pixel[0];
    //     regionsData[i + 1] = pixel[1];
    //     regionsData[i + 2] = pixel[2];
    //     regionsData[i + 3] = pixel[3];
    //   }
    // });

    // const regionsData = [];
    // first.data.forEach((val, i) => {
    //   regionsData.push(...(val === 0 ? [0, 0, 0] : [255, 0, 0]));
    // });
    // const newArr = new Uint8Array(regionsData);

    const r = new RawImage(regionsData, first.width, first.height, 4);
    // const r = new RawImage(newArr, first.width, first.height, 3);
    // const r = new RawImage(first.data, first.width, first.height, first.channels);
    const i1 = r.toCanvas();
    ctx.drawImage(
      i1,
      0, 0, first.width, first.height,
      0, 0, width, height,
    );

    // const imgs = data.map(layer => {

    //   const current = layer.mask;
    //   const r = new RawImage(current.data, current.width, current.height, current.channels);

    //   const i1 = r.toCanvas();
    //   ctx.drawImage(
    //     i1,
    //     0, 0, current.width, current.height,
    //     0, 0, width, height,
    //   );


    // });

    // const { data: originalData, width: wf, height: hf } = data[0].mask;
    // const originalDataSize = originalData.length;
    // const regionsData = new Uint8ClampedArray(originalDataSize*4);

    // canvas.width = wf;
    // canvas.height = hf;

    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, 1000, 1000);

    // console.log('== here ', { wf, hf });

    // data.forEach((e, idx) => {
    //   const pixel = colormap[idx];
    //   console.log({ label: e.label, notEmpty: e.mask.data.filter(a => a === 255).length });

    //   for (let i = 0; i < regionsData.length; i += 4) {
    //     if (e.mask.data[i/4] === 255) break;

    //     regionsData[i] = pixel[0];
    //     regionsData[i + 1] = pixel[1];
    //     regionsData[i + 2] = pixel[2];
    //     regionsData[i + 3] = pixel[3];
    //   }
    // });

    // const imgData = new ImageData(regionsData, wf, hf);

    // // const resized = resizeImageData(imgData, width, height);
    // ctx.putImageData(imgData, 0, 0);

    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, 90, 100);
  }

  const handleMouseMove = (event) => {
    const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);

    if (listRef.current && listRef.current.contains(elementUnderCursor)) {
      elementUnderCursor.classList.add('text-red-600');
      setCurrentClass(elementUnderCursor.textContent);
    }
  };
  const handleMouseLeave = () => {
    const items = listRef.current.querySelectorAll('li');
    items.forEach(item => {
      item.classList.remove('text-red-600');
      setCurrentClass(null);
    });
  };

  return <>
    <div ref={containerRef} className="w-full h-full bg-gray-600 relative">
      <canvas ref={canvasRef}
        className={`border absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${!isCanvasVisible && 'hidden'}`}
        // className={`border absolute w-full h-full ${!isCanvasVisible && 'hidden'}`}
        // className={`border ${!isCanvasVisible && 'hidden'}`}
      >
      </canvas>
    </div>
    <ul ref={listRef} className="bg-white">
      { data.map((d, idx) =>
        <li key={idx} className="cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {d.label}
        </li>
      )}
    </ul>
  </>;
}

function scale(screenSize, imageSize) {
  const { width: ws, height: hs } = screenSize;
  const { width: w, height: h } = imageSize;
  const wRatio = ws/w;
  const hRatio = hs/h;
  const scale = Math.min(wRatio, hRatio);

  return { width: w*scale, height: h*scale };
}

function resizeImageData(imageData, newWidth, newHeight) {
  // Create a temporary canvas
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  // Set the temporary canvas size to the new width and height
  tempCanvas.width = newWidth;
  tempCanvas.height = newHeight;

  // Draw the original image data onto the temporary canvas, scaled to the new size
  tempCtx.drawImage(
      canvasFromImageData(imageData), // Converts the original ImageData to an image source
      0, 0, imageData.width, imageData.height, // Source rectangle
      0, 0, newWidth, newHeight // Destination rectangle
  );

  // Extract the resized ImageData from the temporary canvas
  return tempCtx.getImageData(0, 0, newWidth, newHeight);
}

// Helper function to convert ImageData to an image source
function canvasFromImageData(imageData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

function getColormap(opacity = 1) {
  return colormap.map(c => [...c, 255*opacity]);
}

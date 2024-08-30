import { useEffect, useRef, useState } from 'react';

import { type ISegmentationResult } from '../../globals/types';
import { RawImage } from './image';
import { colormap } from '../lib/globals';

type ISegmentationCanvas = {
  data: ISegmentationResult[],
  img: React.MutableRefObject<HTMLImageElement>,
  currentClass: string,
};
export function SegmentationCanvas({ data, img, currentClass }: ISegmentationCanvas) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [isCanvasVisible, setIsCanvasVisible] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    //Our draw come here
    render();
  }, [render, currentClass]);

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
    const r = new RawImage(regionsData, first.width, first.height, 4);
    const i1 = r.toCanvas();
    ctx.drawImage(
      i1,
      0, 0, first.width, first.height,
      0, 0, width, height,
    );
  }

  return <>
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${!isCanvasVisible && 'hidden'}`}
      >
      </canvas>
    </div>
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

function getColormap(opacity = 1) {
  return colormap.map(c => [...c, 255*opacity]);
}

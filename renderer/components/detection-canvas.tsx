import { useEffect, useRef } from 'react';

import { type IDetectionResult } from '../../globals/types';
import { colormap } from '../lib/globals';

type DetectionCanvasProps = {
  data: IDetectionResult[],
  img: React.MutableRefObject<HTMLImageElement>,
  hovered: IDetectionResult,
};
export function DetectionCanvas({ data, img, hovered }: DetectionCanvasProps) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    //Our draw come here
    render();
  }, [render, hovered]);

  function render() {
    const canvas = canvasRef.current;
    const originalImg = img.current;
    const ctx = canvas.getContext('2d');

    canvas.width = originalImg.width;
    canvas.height = originalImg.height;

    ctx.drawImage(originalImg, 0, 0, originalImg.width, originalImg.height);

    if (!data?.length) return;

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = originalImg.width*1/100;

    data.forEach(({ box }) => {
      printBox(ctx, box.xmin, box.ymin, box.xmax, box.ymax);
    });

    if (hovered) {
      const { xmin, xmax, ymin, ymax } = hovered.box;

      ctx.strokeStyle = 'red';
      ctx.lineWidth = originalImg.width*2/100;

      printBox(ctx, xmin, ymin, xmax, ymax);
    }
  }

  function printBox(ctx, xmin, ymin, xmax, ymax) {
    ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);
  }

  return <>
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef}
        className="absolute max-h-full max-w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
      </canvas>
    </div>
  </>;
}


export const SUPPORTED_TASKS = [
  'image-classification',
  'image-segmentation',
  'object-detection',
  'text-generation',
];
export type TaskType = typeof SUPPORTED_TASKS[number];

export type IModelConfig = {
  name: string,
  files?: string[],
  task: TaskType,
  default?: boolean,
  favorite?: boolean,
};

export interface ISegmentationResult {
  label: string;
  mask: {
    channels: number,
    data: Uint8ClampedArray,
    height: number,
    width: number,
  };
  score: number | null;
};

export interface IDetectionResult {
  label: string;
  box: {
    xmin: number,
    xmax: number,
    ymin: number,
    ymax: number,
  };
  score: number | null;
}

export const MODEL_CONFIG_NAME = './models.json';

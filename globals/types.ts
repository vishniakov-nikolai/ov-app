export const SUPPORTED_TASKS = [
  'image-classification',
  'image-segmentation',
  'object-detection',
  'text-generation',
];
export type TaskType = typeof SUPPORTED_TASKS[number];

export type PredefinedModelConfig = {
  name: string,
  files?: string[],
  task: TaskType,
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

export const SUPPORTED_TASKS = [
  'image-classification',
  'image-segmentation',
  'object-detection',
  'text-generation',
] as const;
export type TaskType = typeof SUPPORTED_TASKS[number];

export type PredefinedModelConfig = {
  name: string,
  files?: string[],
  task: TaskType,
};

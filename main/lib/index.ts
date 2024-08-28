// import InferenceHandlerSingleton, { InferenceHandler } from './inference-handler';

import {
  PredefinedModelConfig,
  SUPPORTED_TASKS,
  TaskType,
} from "../../globals/types";

export class LayoutObj {
  layoutStr: string;
  shape: number[];

  constructor(layout: string, shape: number[]) {
    if (layout.length !== shape.length)
      throw new Error('Shape and layout must have equal size');

    this.layoutStr = layout;
    this.shape = shape;
  }

  get(letter) {
    const index = this.layoutStr.indexOf(letter);

    if (index === -1)
      throw new Error(`Layout '${this.layoutStr} doesn't contain '${letter}' component`);

    return this.shape[index];
  }
}

const DEFAULT_OV_MODEL_FILES = ['openvino_model.xml', 'openvino_model.bin'];

export class PredefinedModel {
  name: string;
  files: string[];
  task: TaskType;

  constructor(config: PredefinedModelConfig) {
    this.name = config.name;
    this.files = config.files || DEFAULT_OV_MODEL_FILES;
    this.task = config.task;
  }

  static isValid(config: { name?: string, files?: string[], task?: string }) {
    return typeof config?.name === "string"
      && SUPPORTED_TASKS.includes(config.task as TaskType)
      && (config.files === undefined || isFilesValid(config.files));

    function isFilesValid(files) {
      return Array.isArray(files)
        &&
        config?.files?.filter(f => typeof f === "string").length
        === config?.files?.length;
    }
  }
}

const InferenceHandlerSingleton = {};
type InferenceHandler = Object;

export { InferenceHandlerSingleton };
export type { InferenceHandler };


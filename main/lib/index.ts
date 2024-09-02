import fs from 'node:fs/promises';

import {
  IModelConfig,
  SUPPORTED_TASKS,
  TaskType,
  MODEL_CONFIG_PATH,
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

export class ModelConfig {
  name: string;
  files: string[];
  task: TaskType;
  default: boolean;

  constructor(config: IModelConfig) {
    if (!ModelConfig.isValid(config))
      throw new Error(`Model config is invalid: ${JSON.stringify(config)}`);

    this.name = config.name;
    this.files = config.files || DEFAULT_OV_MODEL_FILES;
    this.task = config.task;
    this.default = config.default;
  }

  getConfig() {
    return {
      name: this.name,
      files: this.files,
      task: this.task,
      default: this.default,
    };
  }

  static isValid(config: { name?: string, files?: string[], task?: string }) {
    return typeof config?.name === 'string' && config.name.length > 0
      && SUPPORTED_TASKS.includes(config.task as TaskType)
      && (config.files === undefined || isFilesValid(config.files));

    function isFilesValid(files) {
      return Array.isArray(files)
        &&
        config?.files?.filter(f => typeof f === 'string').length
        === config?.files?.length;
    }
  }
}

class ApplicationModels {
  isLoaded: boolean;
  models: ModelConfig[];

  constructor() {
    this.isLoaded = false;
  }

  async load(): Promise<ModelConfig[]> {
    const modelsConfigData = await fs.readFile(MODEL_CONFIG_PATH, 'utf-8');
    const modelsConfig = JSON.parse(modelsConfigData);

    this.models = modelsConfig.map(c => new ModelConfig(c));
    this.isLoaded = true;

    return this.models;
  }

  async add(config: IModelConfig): Promise<ModelConfig[]> {
    if (!ModelConfig.isValid(config))
      throw new Error(`Model config is invalid: ${JSON.stringify(config)}`);

    this.models.push(new ModelConfig(config));
    await this.save();

    return this.models;
  }

  private save(): void {
    const config = this.models.map(m => m.getConfig());

    fs.writeFile(MODEL_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  }

  get(name: string): ModelConfig {
    return this.models.find(m => m.name === name) || null;
  }

  async remove(name: string) {
    this.models = this.models.filter(m => m.name !== name);
    await this.save();

    return await this.load();
  }
}

export function getApplicationModels() {
  let instance = null;

  return { get };

  async function get(): Promise<ApplicationModels> {
    if (!instance) {
      instance = new ApplicationModels();
      await instance.load();
    }

    return instance
  }
}

const InferenceHandlerSingleton = {};
type InferenceHandler = Object;

export { InferenceHandlerSingleton };
export type { InferenceHandler };


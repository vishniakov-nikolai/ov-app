import fs from 'node:fs/promises';
import { join } from 'node:path';

import {
  IModelConfig,
  SUPPORTED_TASKS,
  TaskType,
  MODEL_CONFIG_NAME,
} from "../../globals/types";
import { app, net } from 'electron';

const userDataPath = app.getPath('userData');

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

  private defaultConfigPath = './predefined-models.json';
  private userConfigPath = join(userDataPath, MODEL_CONFIG_NAME);

  constructor() {
    this.isLoaded = false;
  }

  async load(): Promise<ModelConfig[]> {
    try {
      await fs.access(this.userConfigPath, fs.constants.F_OK);
    } catch(e) {
      await fs.copyFile(this.defaultConfigPath, this.userConfigPath);
    }

    const modelsConfigData = await fs.readFile(this.userConfigPath, 'utf-8');
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

  private async save(): Promise<void> {
    const config = this.models.map(m => m.getConfig());

    await fs.writeFile(this.userConfigPath, JSON.stringify(config, null, 2), 'utf-8');
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

export async function checkRemoteFile(modelName, filename) {
  const revision = 'main';
  const remoteHost = 'https://huggingface.co/';
  const remotePathTemplate = '{model}/resolve/{revision}/';
  const url = pathJoin(
    remoteHost,
    remotePathTemplate
      .replaceAll('{model}', modelName)
      .replaceAll('{revision}', encodeURIComponent(revision)),
    filename,
  );
  const response = await net.fetch(url, { method: 'HEAD' });

  return {
    ok: response.ok,
    url,
  };
}

/**
 * Joins multiple parts of a path into a single path, while handling leading and trailing slashes.
 *
 * @param {...string} parts Multiple parts of a path.
 * @returns {string} A string representing the joined path.
 */
function pathJoin(...parts) {
  // https://stackoverflow.com/a/55142565
  parts = parts.map((part, index) => {
      if (index) {
          part = part.replace(new RegExp('^/'), '');
      }
      if (index !== parts.length - 1) {
          part = part.replace(new RegExp('/$'), '');
      }
      return part;
  })
  return parts.join('/');
}

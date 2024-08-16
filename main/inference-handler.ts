const { addon: ov } = require('openvino-node');

import type {
  Core,
  Model,
  CompiledModel,
  InferRequest,
  Tensor,
} from 'openvino-node';

import { hrtime } from 'process';

class InferenceHandler {
  private core: Core = null;
  private model: Model = null;
  private compiledModel: CompiledModel = null;
  private ir: InferRequest = null;

  private modelFiles: string[];

  selectedDevice = 'AUTO';

  constructor(modelFiles: [modelFile: string, modelWeight?: string], device?: string) {
    this.core = new ov.Core();
    this.modelFiles = modelFiles;

    if (device) this.selectedDevice = device;
  }

  async initialize() {
    if (this.modelFiles[1])
      this.model = await this.core.readModel(this.modelFiles[0], this.modelFiles[1]);
    else
      this.model = await this.core.readModel(this.modelFiles[0]);
  }

  inputs() {
    return this.model.inputs;
  }

  async performInference(inputData: { [key: string]: Tensor }, device?: string) {
    if (!this.compiledModel || this.selectedDevice !== device) {
      if (!this.compiledModel) console.log('== Compiled model is absent');
      if (this.selectedDevice !== device) console.log('== Device was changed');

      this.selectedDevice = device || this.selectedDevice;
      console.log('== Use device ', this.selectedDevice);
      this.compiledModel = await this.core.compileModel(this.model, this.selectedDevice);
      console.log('== Model compiled');
      this.ir = this.compiledModel.createInferRequest();
      console.log('== Infer request created');
    }

    const inferenceTimeLabel = 'Inference time';
    console.time(inferenceTimeLabel);
    const startTime = hrtime.bigint();
    console.log(`Inference performes on ${this.selectedDevice}`);
    const inferenceResult = await this.ir.inferAsync(inputData);
    const endTime = hrtime.bigint();
    console.timeEnd(inferenceTimeLabel);

    return {
      inferenceResult,
      elapsedTime: endTime - startTime,
    }
  }
}

const InferenceHandlerSingleton = (function() {
  let instance;

  async function get(modelFilePath?: string, modelWeightPath?: string) {
    if (!instance) {
      if (!modelFilePath)
        throw new Error('InferenceHandler should be initialized with modelFilePath');

      instance = new InferenceHandler([modelFilePath, modelWeightPath]);
      await instance.initialize();
    }

    return instance;
  }

  return { get };
})();

export default InferenceHandlerSingleton;

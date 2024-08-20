const { addon: ov } = require('openvino-node');

import type {
  Core,
  Model,
  CompiledModel,
  InferRequest,
  Tensor,
  Output,
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

  inputs(): Output[] {
    return this.model.inputs;
  }

  async performInference(inputData: { [key: string]: Tensor }, device?: string):
    Promise<{
      inferenceResult: { [outputName: string]: Tensor },
      elapsedTime: BigInt,
    }> {
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

    const startTime = hrtime.bigint();
    console.log(`Inference performes on ${this.selectedDevice}`);
    const inferenceResult = await InferenceHandler.inference(this.ir, inputData);
    const endTime = hrtime.bigint();

    return {
      inferenceResult,
      elapsedTime: endTime - startTime,
    }
  }

  @printExecutionTime('Inference time')
  static inference(ir: InferRequest, input: { [inputName: string]: Tensor }):
    Promise<{ [output: string]: Tensor }> {
    return ir.inferAsync(input);
  }

  get modelFilesPaths(): string[] {
    return this.modelFiles;
  }
}

const InferenceHandlerSingleton = (function() {
  let instance: InferenceHandler | null;

  async function get(modelFilePath?: string, modelWeightPath?: string): Promise<InferenceHandler> {
    if (instance
      && (modelFilePath !== instance.modelFilesPaths[0] || modelWeightPath !== instance.modelFilesPaths[1])) {
      instance = null;
    }

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
export type { InferenceHandler };

function printExecutionTime(label: string) {
  return function<This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Return,
  ) {
    function replacementMethod(this: This, ...args: Args): Return {
      console.time(label);
      const result = target.call(this, ...args);
      console.timeEnd(label);
      return result;
    }

    return replacementMethod;
  };
}

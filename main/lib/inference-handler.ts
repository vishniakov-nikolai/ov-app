import { hrtime } from 'process';
import { env, pipeline } from 'transformers.js';
import { PredefinedModelConfig } from '../../globals/types';
import { PredefinedModel } from '.';

// class InferenceHandler {
//   private core: Core = null;
//   private model: Model = null;
//   private compiledModel: CompiledModel = null;
//   private ir: InferRequest = null;

//   private modelFiles: string[];

//   selectedDevice = 'AUTO';

//   constructor(modelFiles: [modelFile: string, modelWeight?: string], device?: string) {
//     this.core = new ov.Core();
//     this.modelFiles = modelFiles;

//     if (device) this.selectedDevice = device;
//   }

//   async initialize() {
//     if (this.modelFiles[1])
//       this.model = await this.core.readModel(this.modelFiles[0], this.modelFiles[1]);
//     else
//       this.model = await this.core.readModel(this.modelFiles[0]);
//   }

//   inputs(): Output[] {
//     return this.model.inputs;
//   }

//   async performInference(inputData: { [key: string]: Tensor }, device?: string):
//     Promise<{
//       inferenceResult: { [outputName: string]: Tensor },
//       elapsedTime: BigInt,
//     }> {
//     if (!this.compiledModel || this.selectedDevice !== device) {
//       if (!this.compiledModel) console.log('== Compiled model is absent');
//       if (this.selectedDevice !== device) console.log('== Device was changed');

//       this.selectedDevice = device || this.selectedDevice;
//       console.log('== Use device ', this.selectedDevice);
//       this.compiledModel = await this.core.compileModel(this.model, this.selectedDevice);
//       console.log('== Model compiled');
//       this.ir = this.compiledModel.createInferRequest();
//       console.log('== Infer request created');
//     }

//     const startTime = hrtime.bigint();
//     console.log(`Inference performes on ${this.selectedDevice}`);
//     const inferenceResult = await InferenceHandler.inference(this.ir, inputData);
//     const endTime = hrtime.bigint();

//     return {
//       inferenceResult,
//       elapsedTime: endTime - startTime,
//     }
//   }

//   @printExecutionTime('Inference time')
//   static inference(ir: InferRequest, input: { [inputName: string]: Tensor }):
//     Promise<{ [output: string]: Tensor }> {
//     return ir.inferAsync(input);
//   }

//   get modelFilesPaths(): string[] {
//     return this.modelFiles;
//   }
// }

const InferenceHandlerSingleton = (function() {
  let instance;

  let _task: string | null = null;
  let _modelName: string | null = null;
  let _device: string = "AUTO";
  let _files: string[] = null;

  async function init(config: PredefinedModelConfig, device = 'AUTO', inferenceCallback) {
    const modelConfig = new PredefinedModel(config);

    if (instance && (_task !== modelConfig.task || _modelName !== modelConfig.name || _device !== device))
      instance = null;

    if (!instance) {
      if (!modelConfig.name)
        throw new Error('InferenceHandler should be initialized with "modelName"');

      _task = modelConfig.task;
      _modelName = modelConfig.name;
      _device = device;
      _files = modelConfig.files;

      console.log(`Initializing new pipeline: task = ${_task}, model = ${_modelName}, device = ${device}`)
      instance = await pipeline(
        _task,
        _modelName,
        {
          'progress_callback': ({ status, name, file, progress, loaded, total }) => {
            if (!progress) return;

            // process.stdout.clearLine();
            // process.stdout.cursorTo(0);
            process.stdout.write(`== progress of '${file}': ${Math.ceil(progress)}%`);
          },
          'model_file_name': _files,
          // 'model_file_name': ['openvino_encoder_model.xml', 'openvino_encoder_model.bin'],
          // 'model_file_name': ['onnx/model_quantized.onnx'],
          // 'model_file_name': ['onnx/model.onnx'],
          // 'model_file_name': [],
          device: _device,
          inferenceCallback,
        },
      );
      console.log('initialized: ', { _task, _modelName });
    }

    return instance;
  }

  return { init, get: () => instance };
})();

export default InferenceHandlerSingleton;

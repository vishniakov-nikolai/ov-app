import { env, pipeline } from 'transformers.js';
import { PredefinedModelConfig } from '../../globals/types';
import { PredefinedModel } from '.';

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

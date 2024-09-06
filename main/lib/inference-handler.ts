import { join } from 'node:path';
import { app } from 'electron';
import { env, pipeline } from 'transformers.js';

import { IModelConfig } from '../../globals/types';
import { ModelConfig } from '.';

const userDataPath = app.getPath('userData');
const CACHE_DIR = join(userDataPath, 'models');

const InferenceHandlerSingleton = (function() {
  let instance;

  let _task: string | null = null;
  let _modelName: string | null = null;
  let _device: string = "AUTO";
  let _files: string[] = null;

  async function init(
    config: IModelConfig,
    device = 'AUTO',
    inferenceCallback,
    progressCallback,
  ) {
    const modelConfig = new ModelConfig(config);

    if (instance && (_task !== modelConfig.task || _modelName !== modelConfig.name || _device !== device))
      instance = null;

    if (!instance) {
      if (!modelConfig.name)
        throw new Error('InferenceHandler should be initialized with "modelName"');

      _task = modelConfig.task;
      _modelName = modelConfig.name;
      _device = device;
      _files = modelConfig.files;

      env.cacheDir = CACHE_DIR;
      console.log(`Model cache dir set as '${CACHE_DIR}'`);
      console.log(`Initializing new pipeline: task = ${_task}, model = ${_modelName}, device = ${device}`)
      instance = await pipeline(
        _task,
        _modelName,
        {
          'progress_callback': ({ status, name, file, progress, loaded, total }) => {
            if (typeof progressCallback === 'function')
              progressCallback({ status, name, file, progress, loaded, total });

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

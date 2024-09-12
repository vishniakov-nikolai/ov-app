// Action keys, global for all app
const actions = {
  UI: {
    SET: {
      OV: {
        VERSION: 'ui.set.ov.version',
        AVAILABLE_DEVICES: 'ui.set.ov.availableDevices',
      },
    },
    START: {
      INFERENCE: 'ui.start.runInference',
      NEW_CHUNK: 'ui.start.newChunk',
      INIT_MODEL: 'ui.start.initModel',
    },
    END: {
      LOAD_MODELS_LIST: 'ui.end.loadModelsList',
      SELECT_IMG: 'ui.end.selectImg',
      INFERENCE: 'ui.end.runInference',
      INIT_MODEL: 'ui.end.initModel',
      SAVE_MODEL: 'ui.end.saveModel',
      REMOVE_MODEL: 'ui.end.removeModel',
      FETCH_EXCEPTION_INFO: 'ui.end.fetchExceptionInfo',
    },
    EXCEPTION: 'ui.exception',
    PROGRESS_UPDATE: 'ui.progressUpdate',
  },
  BE: {
    OPEN_MODEL: 'be.openModel',
    GET: {
      OV: {
        VERSION: 'be.get.ov.version',
        AVAILABLE_DEVICES: 'be.get.ov.availableDevices',
      },
    },
    START: {
      LOAD_MODELS_LIST: 'be.start.loadModelsList',
      INIT_MODEL: 'be.start.initModel',
      OV: {
        SELECT_IMG: 'be.start.ov.selectImg',
        INFERENCE: 'be.start.ov.inference',
      },
      SAVE_MODEL: 'be.start.ov.saveModel',
      REMOVE_MODEL: 'be.start.ov.removeModel',
      FETCH_EXCEPTION_INFO: 'be.start.fetchExceptionInfo',
    },
    CLOSE_ERROR_WINDOW: 'be.close_error_window',
  }
};

export const BE = actions.BE;
export const UI = actions.UI;

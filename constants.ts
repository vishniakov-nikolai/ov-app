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
    },
    END: {
      LOAD_MODELS_LIST: 'ui.end.loadModelsList',
      SELECT_IMG: 'ui.end.selectImg',
      INFERENCE: 'ui.end.runInference',
      INIT_MODEL: 'ui.end.initModel',
      SAVE_MODEL: 'ui.end.saveModel',
    },
    EXCEPTION: 'ui.exception',
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
    },
  }
};

export const BE = actions.BE;
export const UI = actions.UI;

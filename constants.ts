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
      SSD_INFERENCE: 'ui.start.ssdRunInference',
    },
    END: {
      SELECT_IMG: 'ui.end.selectImg',
      SSD_INFERENCE: 'ui.end.ssdRunInference',
      DOWNLOAD_SEGMENTATION_MODEL: 'ui.end.downloadSegmentationModel',
    },
  },
  BE: {
    OPEN_SAMPLE: 'be.openSample',
    GET: {
      OV: {
        VERSION: 'be.get.ov.version',
        AVAILABLE_DEVICES: 'be.get.ov.availableDevices',
      },
    },
    START: {
      DOWNLOAD_SEGMENTATION_MODEL: 'be.start.downloadSegmentationModel',
      OV: {
        SELECT_IMG: 'be.start.ov.selectImg',
        SSD_INFERENCE: 'be.start.ov.ssdInference',
      },
    },
  }
};

export const BE = actions.BE;
export const UI = actions.UI;

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { UpdateIcon } from '@radix-ui/react-icons';

import Footer from '../components/footer';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import DeviceSelector from '../components/device-selector';
import InferenceTime from '../components/inference-time';
import { BE, UI } from '../../constants';

const DEFAULT_DEVICE = 'AUTO';

const PREDEFINED_MODELS = [
  'v3-small_224_1.0_float',
];
const DEFAULT_MODEL = PREDEFINED_MODELS[0];

export default function SemanticSegmentationSamplePage() {
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [resultData, setResultData] = useState([]);
  const [isInferenceRunning, setIsInferenceRunning] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [selectedDevice, setSelectedDevice] = useState(DEFAULT_DEVICE);

  useEffect(() => {
    setIsModelDownloading(true);
    window.ipc.send(BE.START.DOWNLOAD_SEGMENTATION_MODEL, selectedModel);
  }, [selectedModel]);
  useEffect(() => {
    return window.ipc.on(UI.END.SELECT_IMG, (imgPath) => {
      if (!imgPath) return;

      setSelectedImg(imgPath);
      initiateInference(imgPath);
    });
  }, [selectedDevice, selectedModel]);
  useEffect(() => {
    return window.ipc.on(UI.END.DOWNLOAD_SEGMENTATION_MODEL, (paths) => {
      console.log(paths);
      setIsModelDownloading(false);
    });
  }, []);
  useEffect(() => {
    return window.ipc.on(UI.START.SSD_INFERENCE, () => {
      console.log('=== Inference running...');
      setIsInferenceRunning(true);
    });
  }, []);
  useEffect(() => {
    return window.ipc.on(UI.END.SSD_INFERENCE, (inferenceResult:
      {
        data?: { prediction: number, classId: number }[],
        elapsedTime: BigInt,
      }) => {
      setIsInferenceRunning(false);
      setResultData(inferenceResult.data);
      setInferenceTime(inferenceResult.elapsedTime);
      console.log('=== Inference done');
    });
  }, []);
  useEffect(() => {
    return window.ipc.on(UI.EXCEPTION, (errorMessage) => {
      setIsInferenceRunning(false);
      alert(errorMessage);
    });
  }, []);
  useEffect(() => {
    setSelectedImg(null);
    setResultData(null);
    setInferenceTime(null);
  }, [selectedDevice, selectedModel]);

  function initiateInference(imgPath) {
    setResultData(null);
    setInferenceTime(null);

    window.ipc.send(BE.START.OV.SSD_INFERENCE, {
      modelLabel: selectedModel,
      imgPath,
      device: selectedDevice
    });
  }

  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Classification Demo</title>
      </Head>
      {
        isModelDownloading &&
        <div className="banner text-white">
          <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
          Model Downloading...
        </div>
      }
      <div className="content w-auto">
        <div className="p-5">
          <h1 className="text-4xl mb-8">Classification Demo</h1>
          <fieldset disabled={isInferenceRunning}>
            <ul className="leading-10 mb-3">
              <li className="flex mb-3">
                <span className="mr-2 w-[80px]">Model:</span>
                <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
                  { PREDEFINED_MODELS.map(m =>
                    <div key={m} className="flex items-center space-x-2">
                      <RadioGroupItem value={m} id={m} />
                      <Label htmlFor={m}>{m}</Label>
                    </div>
                  ) }
                </RadioGroup>
              </li>
              <li className="flex mb-3">
                <span className="mr-2 w-[80px]">Device:</span>
                <DeviceSelector
                  setSelectedDevice={setSelectedDevice}
                />
              </li>
            </ul>

            <div className="mb-5">
              <Button
                onClick={() => window.ipc.send(BE.START.OV.SELECT_IMG)}
                className="mr-2"
              >Select Image</Button>
              { selectedImg &&
                <Button
                  variant="secondary"
                  onClick={() => { initiateInference(selectedImg) }}
                >Rerun Inference</Button>
              }
            </div>
          </fieldset>
          <div className="border border-gray flex min-h-80">
            <div className="w-1/2 flex items-center justify-center relative p-4">
              { selectedImg &&
                <img src={selectedImg} alt="User img" className="absolute inset-0 w-full h-full object-contain p-2" />
              }
              <span className="text-center text-xl">User Image</span>
            </div>
            <div className="w-1/2 flex items-center justify-center relative p-4">
              { resultData &&
                JSON.stringify(resultData)
              }
              { !resultData &&
                <span className="text-center text-xl">
                  {
                    isInferenceRunning
                      ? <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                      : 'Results'
                  }
                </span>
              }
            </div>
          </div>
          {
            inferenceTime &&
            <InferenceTime value={inferenceTime} />
          }
        </div>
        <Footer className="mt-auto" />
      </div>

    </React.Fragment>
  )
}

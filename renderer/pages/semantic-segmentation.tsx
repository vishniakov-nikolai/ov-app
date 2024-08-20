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
  'road-segmentation-adas-0001',
  'selfie-multiclass',
];
const DEFAULT_MODEL = PREDEFINED_MODELS[0];

export default function SemanticSegmentationSamplePage() {
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [userImg, setUserImg] = useState(null);
  const [resultImg, setResultImg] = useState(null);
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

      setUserImg(imgPath);
      setResultImg(null);
      setInferenceTime(null);

      console.log(`Selected model: ${selectedModel}`);

      window.ipc.send(BE.START.OV.SSD_INFERENCE, {
        modelLabel: selectedModel,
        imgPath,
        device: selectedDevice
      });
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
        outputPath: string,
        elapsedTime: BigInt,
      }) => {
      setIsInferenceRunning(false);
      setResultImg(inferenceResult.outputPath);
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

  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Semantic Segmentation Demo</title>
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
          <h1 className="text-4xl mb-8">Semantic Segmentation Demo</h1>
          <fieldset disabled={isInferenceRunning}>
            <ul className="leading-10 mb-3">
              {/* <li>
                <span className="mr-2">Model:</span>

              </li> */}
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
            </div>
          </fieldset>
          <div className="border border-gray flex min-h-80">
            <div className="w-1/2 flex items-center justify-center relative p-4">
              { userImg &&
                <img src={userImg} alt="User img" className="absolute inset-0 w-full h-full object-contain p-2" />
              }
              <span className="text-center text-xl">User Image</span>
            </div>
            <div className="w-1/2 flex items-center justify-center relative p-4">
              { resultImg &&
                <img src={resultImg} alt="Result img" className="absolute inset-0 w-full h-full object-contain p-2" />
              }
              <span className="text-center text-xl">
                {
                  isInferenceRunning
                    ? <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                    : 'Result Image'
                }
              </span>
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

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { UpdateIcon } from '@radix-ui/react-icons';

import Footer from '../components/footer';
import { Button } from '../components/ui/button';
import DeviceSelector from '../components/device-selector';
import InferenceTime from '../components/inference-time';
import { BE, UI } from '../../constants';

const DEFAULT_DEVICE = 'AUTO';

export default function SemanticSegmentationSamplePage() {
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [userImg, setUserImg] = useState(null);
  const [resultImg, setResultImg] = useState(null);
  const [isInferenceRunning, setIsInferenceRunning] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(DEFAULT_DEVICE);

  useEffect(() => {
    setIsModelDownloading(true);
    window.ipc.send(BE.START.DOWNLOAD_SEGMENTATION_MODEL);

    window.ipc.on(UI.END.SELECT_IMG, (imgPath) => {
      if (!imgPath) return;

      setUserImg(imgPath);
      setResultImg(null);
      setInferenceTime(null);
      window.ipc.send(BE.START.OV.SSD_INFERENCE, { imgPath, device: selectedDevice });
    });
    window.ipc.on(UI.END.DOWNLOAD_SEGMENTATION_MODEL, (paths) => {
      console.log(paths);
      setIsModelDownloading(false);
    });
    window.ipc.on(UI.START.SSD_INFERENCE, () => {
      console.log('=== Inference running...');
      setIsInferenceRunning(true);
    });
    window.ipc.on(UI.END.SSD_INFERENCE, (inferenceResult:
      {
        outputPath: string,
        elapsedTime: BigInt,
      }) => {
      setIsInferenceRunning(false);
      setResultImg(inferenceResult.outputPath);
      setInferenceTime(inferenceResult.elapsedTime);
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
          <ul className="leading-10 mb-3">
            <li>
              <span className="mr-2">Model:</span>
              <a target="_blank" href="https://docs.openvino.ai/2023.0/omz_models_model_road_segmentation_adas_0001.html">road-segmentation-adas-0001</a>
            </li>
            <li className="flex">
              <span className="mr-2">Device:</span>
              <DeviceSelector
                setSelectedDevice={setSelectedDevice}
              />
            </li>
          </ul>

          <div className="mb-5">
            <Button
              onClick={() => window.ipc.send(BE.START.OV.SELECT_IMG)}
              disabled={isInferenceRunning}
              className="mr-2"
            >Select Image</Button>
          </div>
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

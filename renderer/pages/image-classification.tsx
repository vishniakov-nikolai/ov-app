import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useSearchParams } from 'next/navigation'

import Footer from '../components/footer';
import { Button } from '../components/ui/button';
import DeviceSelector from '../components/device-selector';
import InferenceTime from '../components/inference-time';
import { BE, UI } from '../../constants';
import DistributionGraph from '../components/distribution-graph';

const DEFAULT_DEVICE = 'AUTO';

export default function ImageClassificationPage() {
  const searchParams = useSearchParams()
  const modelName = searchParams.get('model');
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [resultData, setResultData] = useState([]);
  const [isInferenceRunning, setIsInferenceRunning] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(DEFAULT_DEVICE);

  useEffect(() => {
    setIsModelDownloading(true);

    if (!modelName || !selectedDevice) return;

    window.ipc.send(BE.START.INIT_MODEL, { modelName, device: selectedDevice });
  }, [modelName, selectedDevice]);
  useEffect(() => {
    return window.ipc.on(UI.END.INIT_MODEL, (paths) => {
      console.log(paths);
      setIsModelDownloading(false);
    });
  }, []);

  useEffect(() => {
    return window.ipc.on(UI.END.SELECT_IMG, (imgPath) => {
      if (!imgPath) return;

      setSelectedImg(imgPath);
      initiateInference(imgPath);
    });
  }, [selectedDevice]);
  useEffect(() => {
    return window.ipc.on(UI.START.INFERENCE, () => {
      console.log('=== Inference running...');
      setIsInferenceRunning(true);
    });
  }, []);
  useEffect(() => {
    return window.ipc.on(UI.END.INFERENCE, (inferenceResult:
      {
        data?: { label: string, score: number }[],
        elapsedTime: BigInt,
      }) => {
        console.log(inferenceResult);

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
  }, [selectedDevice]);

  function initiateInference(imgPath) {
    setResultData(null);
    setInferenceTime(null);

    window.ipc.send(BE.START.OV.INFERENCE, {
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
          <h1 className="text-4xl mb-8">{modelName}</h1>
          <fieldset disabled={isInferenceRunning}>
            <ul className="leading-10 mb-3">
              <li className="flex mb-3">
                <span className="mr-2 w-[80px]">Task:</span>
                Image Classification
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
                <DistributionGraph probablities={resultData} />
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

function preprocessDict(dictionary: { [classId: number]: [string, string] }) {
  const size = Object.keys(dictionary).length;

  return Array.from({ length: size }, (_, idx) => {
    const value = dictionary[idx];

    return typeof value === 'string' ? value
      : value[1] || value[0];
  });
}

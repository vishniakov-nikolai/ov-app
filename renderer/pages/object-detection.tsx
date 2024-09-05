import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useSearchParams } from 'next/navigation'

import Footer from '../components/footer';
import { Button } from '../components/ui/button';
import DeviceSelector from '../components/device-selector';
import InferenceTime from '../components/inference-time';
import { BE, UI } from '../../constants';
import { IDetectionResult } from '../../globals/types';
import { DetectionCanvas } from '../components/detection-canvas';
import { DetectionsList } from '../components/detections-list';

const DEFAULT_DEVICE = 'AUTO';
const TASK_NAME = 'Object Detection';

export default function ImageSegmentationPage() {
  const searchParams = useSearchParams()
  const modelName = searchParams.get('model');

  const inputImgRef = useRef();

  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isInferenceRunning, setIsInferenceRunning] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(DEFAULT_DEVICE);
  const [detectionResult, setDetectionResult] = useState<IDetectionResult[]>(null);
  const [filteredResults, setFilteredResults] = useState<IDetectionResult[]>(null);
  const [hoveredResult, setHoveredResult] = useState<IDetectionResult>(null);

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
        data: IDetectionResult[],
        elapsedTime: BigInt,
      }) => {
        console.log(inferenceResult);
      setIsInferenceRunning(false);
      setDetectionResult(inferenceResult.data);
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
    setDetectionResult(null);
    setInferenceTime(null);
  }, [selectedDevice]);

  function initiateInference(imgPath) {
    setDetectionResult(null);
    setInferenceTime(null);

    window.ipc.send(BE.START.OV.INFERENCE, {
      value: imgPath,
    });
  }

  return (
    <React.Fragment>
      <Head>
        <title>{ `OpenVINO App | ${TASK_NAME} | ${modelName}` }</title>
      </Head>
      {
        isModelDownloading &&
        <div className="banner text-white">
          <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
          Model Downloading...
        </div>
      }
      <div className="content w-auto">
        <div className="flex flex-col p-5 grow">
          <h1 className="text-4xl mb-8">{modelName}</h1>
          <fieldset disabled={isInferenceRunning}>
            <ul className="leading-10 mb-3">
            <li className="flex mb-3">
                <span className="mr-2 w-[80px]">Task:</span>
                { TASK_NAME }
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
                >Repeat Inference</Button>
              }
            </div>
          </fieldset>
          <div className="border border-gray flex min-h-80 grow">
            <div className="hidden">
              { selectedImg &&
                <img ref={inputImgRef} src={selectedImg} alt="User img" className="absolute inset-0 w-full h-full object-contain p-2" />
              }
            </div>
            <div className="w-1/2 flex items-center justify-center relative p-4">
              { detectionResult
                ? <div className="w-full h-full">
                  <DetectionCanvas
                    data={filteredResults}
                    hovered={hoveredResult}
                    img={inputImgRef}
                  />
                </div>
                : <span className="text-center text-xl">
                    {
                      isInferenceRunning
                        ? <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                        : 'Result Image'
                    }
                  </span>
              }
            </div>
            <div className="w-1/2 flex relative p-4">
              {
                detectionResult &&
                <DetectionsList
                  items={detectionResult}
                  filtered={filteredResults}
                  setFiltered={setFilteredResults}
                  setHovered={setHoveredResult}
                />
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

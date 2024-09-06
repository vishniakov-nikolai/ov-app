import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useSearchParams } from 'next/navigation'

import Footer from '../components/footer';
import { Button } from '../components/ui/button';
import DeviceSelector from '../components/device-selector';
import InferenceTime from '../components/inference-time';
import { BE, UI } from '../../constants';
import { ISegmentationResult } from '../../globals/types';
import { SegmentationCanvas } from '../components/segmentation-canvas';
import RegionsList from '../components/regions-list';

const DEFAULT_DEVICE = 'AUTO';

export default function ImageSegmentationPage() {
  const searchParams = useSearchParams()
  const modelName = searchParams.get('model');

  const inputImgRef = useRef();

  const [selectedImg, setSelectedImg] = useState(null);
  const [isInferenceRunning, setIsInferenceRunning] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(DEFAULT_DEVICE);
  const [segmentationResult, setSegmentationResult] = useState<ISegmentationResult[]>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string>(null);

  useEffect(() => {
    if (!modelName || !selectedDevice) return;

    window.ipc.send(BE.START.INIT_MODEL, { modelName, device: selectedDevice });
  }, [modelName, selectedDevice]);

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
        data: ISegmentationResult[],
        elapsedTime: BigInt,
      }) => {
      setIsInferenceRunning(false);
      setSegmentationResult(inferenceResult.data);
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
    setSegmentationResult(null);
    setInferenceTime(null);
  }, [selectedDevice]);

  function initiateInference(imgPath) {
    setSegmentationResult(null);
    setInferenceTime(null);

    window.ipc.send(BE.START.OV.INFERENCE, {
      value: imgPath,
    });
  }

  return (
    <React.Fragment>
      <Head>
        <title>{ `OpenVINO App | Image Sermentation | ${modelName}` }</title>
      </Head>
      <div className="content w-auto">
        <div className="p-5">
          <h1 className="text-4xl mb-8">{modelName}</h1>
          <fieldset disabled={isInferenceRunning}>
            <ul className="leading-10 mb-3">
            <li className="flex mb-3">
                <span className="mr-2 w-[80px]">Task:</span>
                Image Segmentation
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
                <img ref={inputImgRef} src={selectedImg} alt="User img" className="absolute inset-0 w-full h-full object-contain p-2" />
              }
              <span className="text-center text-xl">User Image</span>
            </div>
            <div className="w-1/2 flex items-center justify-center relative p-4">
              { segmentationResult
                ? <div className="w-full h-full">
                  <SegmentationCanvas
                    data={segmentationResult}
                    img={inputImgRef}
                    currentClass={hoveredRegion}
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
          </div>
          { segmentationResult?.length &&
            <RegionsList
              names={segmentationResult.map(v => v.label)}
              setCurrentClass={setHoveredRegion}
            />
          }
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

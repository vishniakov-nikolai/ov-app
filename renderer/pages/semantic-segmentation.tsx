import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Editor from '@monaco-editor/react';
import { UpdateIcon } from '@radix-ui/react-icons';

import Footer from '../components/footer';
import { Button } from '../components/ui/button';

export default function SemanticSegmentationSamplePage() {
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [userImg, setUserImg] = useState(null);
  const [resultImg, setResultImg] = useState(null);
  const [isInferenceRunning, setIsInferenceRunning] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(null);
  const codeSample = `// Add openvino-node package
const { ov: addon } = require('openvino-node');`;

  useEffect(() => {
    setIsModelDownloading(true);
    window.ipc.send('app.start.downloadSegmentationModel');

    window.ipc.on('app.end.selectImage', (imgPath) => {
      console.log({ imgPath });

      if (!imgPath) return;

      setUserImg(imgPath);
      setResultImg(null);
      setInferenceTime(null);
      console.log({ imgPath });
      window.ipc.send('ov.start.ssd.runInference', imgPath);
    });
    window.ipc.on('app.end.downloadSegmentationModel', (paths) => {
      console.log(paths);
      setIsModelDownloading(false);
    });
    window.ipc.on('ov.start.ssd.runInference', () => {
      console.log('=== Inference running...');
      setIsInferenceRunning(true);
    });
    window.ipc.on('ov.end.ssd.runInference', (inferenceResult:
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
      <div className="p-10">
        <h1>Semantic Segmentation Demo</h1>
        <p>
          In this demo, a pre-trained
          <a target="_blank" href="https://docs.openvino.ai/2023.0/omz_models_model_road_segmentation_adas_0001.html">road-segmentation-adas-0001</a>
          model uses</p>
        <Button
          onClick={() => window.ipc.send('app.start.selectImage')}
          disabled={isInferenceRunning}
        >Select Image</Button>
        <Button variant="secondary" onClick={() => setShowSourceCode(!showSourceCode)}>
          { showSourceCode ? 'Hide' : 'Show' } Source Code
        </Button>
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
          <div className="center">
            Inference time:&nbsp;
            { formatNanoseconds(inferenceTime) }ms
          </div>
        }
      </div>
      {
        showSourceCode &&
        <div className="border border-black">
          <Editor height="90vh" defaultLanguage="javascript" defaultValue={codeSample} />
        </div>
      }
      <Footer />
    </React.Fragment>
  )
}

function formatNanoseconds(bigNumber) {
  return Math.floor(Number(bigNumber) / 1000000);
}

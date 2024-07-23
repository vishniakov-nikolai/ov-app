import React, { useState } from 'react';
import Head from 'next/head';
import Editor from '@monaco-editor/react';

import Footer from '../components/footer';
import { Button } from '../components/ui/button';

export default function HomePage() {
  const [showSourceCode, setShowSourceCode] = useState(false);
  const codeSample = `// Add openvino-node package
const { ov: addon } = require('openvino-node');`;

  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Semantic Segmentation Demo</title>
      </Head>
      <div className="content">
        <h1>Semantic Segmentation Demo</h1>
        <p>
          In this demo, a pre-trained
          <a target="_blank" href="https://docs.openvino.ai/2023.0/omz_models_model_road_segmentation_adas_0001.html">road-segmentation-adas-0001</a>
          model uses</p>
        <Button>Select Image</Button>
        <Button variant="secondary" onClick={() => setShowSourceCode(!showSourceCode)}>
          { showSourceCode ? 'Hide' : 'Show' } Source Code
        </Button>
        <div className="placeholder"></div>

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

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Editor from '@monaco-editor/react';

import Footer from '../components/footer';

export default function HomePage() {
  const codeSample = `// Add openvino-node package
const { ov: addon } = require('openvino-node');`;
  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Semantic Segmentation Demo</title>
      </Head>
      <div className="content">
        <Link href="/home">Back</Link>
        <h1>Semantic Segmentation Demo</h1>
        <p>
          In this demo, a pre-trained
          <a target="_blank" href="https://docs.openvino.ai/2023.0/omz_models_model_road_segmentation_adas_0001.html">road-segmentation-adas-0001</a>
          model uses</p>
        <button className="btn">
          Select Image
        </button>
        <br />
        <div id="placeholder" className="placeholder"></div>

      </div>
      <div className="border border-black">
        <Editor height="90vh" defaultLanguage="javascript" defaultValue={codeSample} />
      </div>
      <Footer />
    </React.Fragment>
  )
}

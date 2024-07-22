import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Editor from '@monaco-editor/react';

export default function HomePage() {
  const [message, setMessage] = React.useState('No message found');
  const codeSample = `// Add openvino-node package
const { ov: addon } = require('openvino-node');`;

  React.useEffect(() => {
    window.ipc.on('message', (message) => {
      setMessage(`Uses OpenVINO v${message.CPU.buildNumber}`)
    })
  }, [])

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
        <button
          id="uploadButton"
          onClick={() => {
            window.ipc.send('message', 'Hello')
          }}
        >
          Select Image
        </button>
        <br />
        <div id="placeholder" className="placeholder"></div>
        <p id="info" className="info">{message}</p>
      </div>
      <div>
        <Editor height="90vh" defaultLanguage="javascript" defaultValue={codeSample} />;
      </div>
    </React.Fragment>
  )
}

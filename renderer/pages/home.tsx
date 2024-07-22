import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Editor from '@monaco-editor/react';

function Select() {
  return <div className="select">Semantic Segmentation</div>
}

export default function HomePage() {
  const [message, setMessage] = React.useState('No message found');
  const codeSample = `// Add openvino-node package
const { ov: addon } = require('openvino-node');`;

  React.useEffect(() => {
    window.ipc.on('message', (message: string) => {
      setMessage(message)
    })
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO JS + Electron Demo</title>
      </Head>
      <div className="content">
        <h1>🍷 OpenVINO JS + Electron Demo</h1>
        <p>
          Select Sample
        </p>
        <Select />
        <Link className="button" href="/semantic-segmentation">Run Sample</Link>
        <br />
        <div id="placeholder" className="placeholder"></div>
      </div>
    </React.Fragment>
  )
}

import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// function Select() {
//   return <div className="select">Semantic Segmentation</div>
// }

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
        <h1 className="text-3xl font-bold">🍷 OpenVINO JS + Electron Demo</h1>
        <p>Select Task</p>
        <Select>
          <SelectTrigger className="w-100">
            <SelectValue placeholder="Select Task" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ssd">Semantic Segmentation</SelectItem>
            <SelectItem value="classification">Classification</SelectItem>
            <SelectItem value="od">Object Detection</SelectItem>
          </SelectContent>
        </Select>

        <Link className="btn" href="/semantic-segmentation">Run Sample</Link>
        <br />
        <div id="placeholder" className="placeholder"></div>
      </div>
    </React.Fragment>
  )
}

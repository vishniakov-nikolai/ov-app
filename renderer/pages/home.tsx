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
import Footer from '../components/footer';

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Home</title>
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
      </div>
      <Footer />
    </React.Fragment>
  )
}

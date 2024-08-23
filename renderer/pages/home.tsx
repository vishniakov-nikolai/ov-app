import React from 'react';
import Head from 'next/head';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import Footer from '../components/footer';
import { useAppContext } from '../providers/app-context';
import { Button } from '../components/ui/button';
import { BE } from '../../constants';

export default function HomePage() {
  const { sample, defaultSample, setSample } = useAppContext();

  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Home</title>
      </Head>
      <div className="content w-[580px]">
        <div className="flex justify-center mt-20 mb-12">
          <img
            className="w-[360px]"
            src="/svg/ov-logo.svg" alt="OpenVINO logo" />
          <p className="text-6xl ml-3">App</p>
        </div>
        <p>Select Task</p>
        <Select
          defaultValue={defaultSample}
          onValueChange={setSample}
        >
          <SelectTrigger className="w-100 mb-12">
            <SelectValue placeholder="Select Task" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classification">Classification</SelectItem>
            <SelectItem value="semantic-segmentation">Semantic Segmentation</SelectItem>
            <SelectItem value="object-detection">Object Detection</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => {
            window.ipc.send(BE.OPEN_SAMPLE, sample);
          }}
        >
          Run Sample
        </Button>
        <Footer className="mt-auto" />
      </div>
    </React.Fragment>
  )
}

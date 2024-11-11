import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { BE, UI } from '../../constants';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from '../components/ui/select';
import CameraView from '../components/camera-view';

export default function ErrorWindow() {
  const [capturingDevices, setCapturingDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    console.log('update')

    navigator.mediaDevices.enumerateDevices().then(devices => {
      const availableDevices = devices.filter(d => d.kind === 'videoinput');

      setCapturingDevices(availableDevices);
      setSelectedDevice(availableDevices[0]?.deviceId);
    });
  }, []);

  function closeWindow() {
    window.ipc.send(BE.CLOSE_ERROR_WINDOW);
  }

  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Take a Photo</title>
      </Head>
      <div className="flex flex-col flex-nowrap h-full items-center p-4">
        <div className="flex items-center mb-2 gap-2">
          <h1 className="font-medium text-xl">
            Take a Photo using:
          </h1>
          <Select
            value={selectedDevice}
            onValueChange={setSelectedDevice}
          >
            <SelectTrigger className="w-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {capturingDevices.map((d, idx) =>
                <SelectItem key={idx} value={d.deviceId}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <CameraView deviceId={selectedDevice} />
      </div>
    </React.Fragment>);
}

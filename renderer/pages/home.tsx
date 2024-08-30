import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { UpdateIcon } from '@radix-ui/react-icons';

import Footer from '../components/footer';
import { useAppContext } from '../providers/app-context';
import { Button } from '../components/ui/button';
import { BE, UI } from '../../constants';
import ModelsList from '../components/models-list';

import type { PredefinedModelConfig } from '../../globals/types';

export default function HomePage() {
  const [modelsList, setModelsList] = useState<PredefinedModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    window.ipc.send(BE.START.LOAD_MODELS_LIST);
  }, []);
  useEffect(() => {
    return window.ipc.on(
      UI.END.LOAD_MODELS_LIST,
      (models: PredefinedModelConfig[]) => {
        setModelsList(models);
        setIsLoading(false);
        console.log(models);
      },
    );
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Home</title>
      </Head>
      {
        isLoading &&
        <div className="banner text-white">
          <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
          Loading Models List...
        </div>
      }
      <div className="flex flex-col flex-nowrap h-full">
        <nav className="flex justify-center p-4 border-b">
          <img
            className="w-[360px]"
            src="/svg/ov-logo.svg" alt="OpenVINO logo" />
          <p className="text-6xl ml-3">App</p>
          <p className="text-6xl ml-3">/ Models List</p>
        </nav>
        <ModelsList
          models={modelsList}
          onSelect={(modelName) => window.ipc.send(BE.OPEN_MODEL, modelName)}
        />
        <Footer className="mt-auto border-t" />
      </div>
    </React.Fragment>
  )
}

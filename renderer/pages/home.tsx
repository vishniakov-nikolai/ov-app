import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { UpdateIcon } from '@radix-ui/react-icons';

import { BE, UI } from '../../constants';
import ModelsList from '../components/models-list';

import type { IModelConfig } from '../../globals/types';
import { SearchInput } from '../components/ui/search-input';

export default function HomePage() {
  const [modelsList, setModelsList] = useState<IModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [filteredModels, setFilteredModels] = useState<IModelConfig[]>([]);

  useEffect(() => {
    setIsLoading(true);
    window.ipc.send(BE.START.LOAD_MODELS_LIST);
  }, []);
  useEffect(() => {
    return window.ipc.on(
      UI.END.LOAD_MODELS_LIST,
      (models: IModelConfig[]) => {
        setModelsList(models);
        setIsLoading(false);
        console.log(models);
      },
    );
  }, []);
  useEffect(() => {
    return window.ipc.on(
      UI.END.REMOVE_MODEL,
      (models: IModelConfig[]) => {
        setModelsList(models);
        setIsLoading(false);
      },
    );
  }, []);
  useEffect(() => {
    const filteredModels = !filter?.length
      ? modelsList
      : modelsList.filter(m =>
        m.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
      );

    setFilteredModels(filteredModels);
  }, [filter, modelsList]);

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
      <div className="flex flex-col flex-nowrap h-full bg-gray-50">
        <nav className="flex p-4 border-b items-center shadow-md bg-white">
          <img
            className="w-[145px] mt-[2px]"
            src="/svg/ov-logo.svg" alt="OpenVINO logo" />
          <p className="text-3xl ml-2 font-medium pr-4">App</p>
          <p className="text-2xl pl-4 border-l">Models List</p>
          <div className="w-[200px] ml-auto">
            <SearchInput placeholder="Filter Models"
              onChange={(e) => setFilter(e.target.value)} value={filter} />
          </div>
        </nav>
        <ModelsList
          models={filteredModels}
          filter={filter}
          onSelect={(modelName) => window.ipc.send(BE.OPEN_MODEL, modelName)}
          onRemove={removeModel}
        />
        <footer className="p-5 mt-auto border-t shadow-md bg-white">
          <div className="text-center mono text-sm">
            Available {modelsList.length} Models
            { !!filter?.length && ` / Found ${filteredModels.length} by Filter` }
          </div>
        </footer>
      </div>
    </React.Fragment>
  );

  function removeModel(name: string) {
    setIsLoading(true);

    window.ipc.send(BE.START.REMOVE_MODEL, { name });
  }
}

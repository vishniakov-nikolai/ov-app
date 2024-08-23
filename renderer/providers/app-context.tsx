import { createContext, useContext, useState, useEffect } from 'react';
import { BE, UI } from '../../constants';

interface ovVersion {
  buildNumber: string,
  description: string,
};

interface IAppContext {
  ovInfo: {
    CPU?: ovVersion,
    GPU?: ovVersion,
    NPU?: ovVersion,
  },
  versions: {
    node: string | null,
    chrome: string | null,
    electron: string | null,
  },
  sample?: string,
  defaultSample?: string,
  setSample?: (string) => null,
  availableDevices: string[],
};

const DEFAULT_SAMPLE = 'classification';

const defaultContext: IAppContext = {
  ovInfo: {
    CPU: null,
  },
  versions: {
    node: null,
    chrome: null,
    electron: null,
  },
  defaultSample: DEFAULT_SAMPLE,
  availableDevices: [],
};

const Context = createContext(defaultContext);

export function AppContextProvider({ children }) {
  const [sample, setSample] = useState(DEFAULT_SAMPLE);
  const [ovInfo, setOvInfo] = useState(defaultContext.ovInfo);
  const [availableDevices, setAvailableDevices] = useState(['AUTO']);

  const ctx = Object.assign({}, defaultContext, {
    sample,
    setSample,
    ovInfo,
    availableDevices,
  });

  useEffect(() => {
    window.ipc.send(BE.GET.OV.VERSION);
    window.ipc.on(UI.SET.OV.VERSION, (versions) => {
      setOvInfo(versions);
    });

    window.ipc.send(BE.GET.OV.AVAILABLE_DEVICES);
    window.ipc.on(UI.SET.OV.AVAILABLE_DEVICES, (devices: string[]) => {
      setAvailableDevices(devices);
    });
  }, []);

  return (
    <Context.Provider
      value={ctx}>
      {children}
    </Context.Provider>
  );
}

export function useAppContext() {
  return useContext(Context);
}

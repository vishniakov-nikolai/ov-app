import { createContext, useContext, useState, useEffect } from 'react';

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
  theme?: string,
  setTheme?: (string) => null,
};

const defaultContext: IAppContext = {
  ovInfo: {
    CPU: null,
  },
  versions: {
    node: null,
    chrome: null,
    electron: null,
  },
};

const Context = createContext(defaultContext);

export function AppContextProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [ovInfo, setOvInfo] = useState(defaultContext.ovInfo);

  const ctx = Object.assign({}, defaultContext, {
    theme,
    setTheme,
    ovInfo,
  });

  useEffect(() => {
    window.ipc.send('ov.getVersions');

    window.ipc.on('setOvInfo', (versions) => {
      setOvInfo(versions);
    })
  }, [])

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

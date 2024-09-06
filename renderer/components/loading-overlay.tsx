import { UpdateIcon } from '@radix-ui/react-icons';
import { UI } from '../../constants';
import { useEffect, useState } from 'react';

export function LoadingOverlay() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    return window.ipc.on(UI.START.INIT_MODEL, () => {
      console.log('=== Model initializing...');
      setVisible(true);
    });
  }, []);
  useEffect(() => {
    return window.ipc.on(UI.END.INIT_MODEL, () => {
      console.log('=== End model initializing...');
      setVisible(false);
    });
  }, []);
  useEffect(() => {
    type ProgressInfo = {
      status?: string,
      name?: string,
      file?: string,
      progress?: string,
    };
    return window.ipc.on(UI.PROGRESS_UPDATE, (progressInfo: ProgressInfo) => {
      console.log(progressInfo)

      setStatus(progressInfo.status);
      setName(progressInfo.name);
      setProgress(progressInfo.progress);
    });
  }, []);

  return visible && <div className="banner text-white">
    <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
    { status === 'ready' ? 'Model Loading on device...' : 'Model Downloading...' }
  </div>;
}

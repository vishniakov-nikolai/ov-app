import { useEffect, useState } from 'react';
import { UpdateIcon, CheckCircledIcon } from '@radix-ui/react-icons';

import { UI } from '../../constants';
import { round } from '../lib/utils';

export function LoadingOverlay() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('loading');
  const [files, setFiles] = useState([]);

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
      if (['download', 'ready'].includes(progressInfo.status))
        setStatus(progressInfo.status);

      const { status, file, progress } = progressInfo;

      if (!file) return;

      const newFiles = Object.assign({}, files);

      newFiles[progressInfo.file] = { status, progress };

      setFiles(newFiles);
    });
  }, [files]);

  return visible && <div className="banner text-white">
    <div>
      { Object.keys(files).map((f, idx) =>
        <FileStatus
          key={idx} name={f}
          status={files[f].status}
          progress={files[f].progress}
        />) }
      <OverallStatus status={status} />
    </div>
  </div>;
}

type FileStatusProps = {
  name: string,
  status?: string,
  progress?: number,
};
function FileStatus({ name, status, progress }: FileStatusProps) {
  switch(status) {
    case 'download':
    case 'progress':
      return <Status status={name} isReady={false} progress={progress || 0} />;
    case 'done':
      return <Status status={name} isReady={true} />;
    default:
      return;
  }
}

type OveralStatusProps = { status };
function OverallStatus({ status }: OveralStatusProps) {
  let statusTxt = 'Model Loading...';
  let isReady = false;

  if (status === 'download')
    statusTxt = 'Model Downloading...';
  else if (status === 'ready') {
    statusTxt = 'Model Ready';
    isReady = true;
  }

  return <Status status={statusTxt} isReady={isReady} />;
}

type StatusProps = { status: string, isReady: boolean, progress?: number };
function Status(props: StatusProps) {
  const progress = props.progress || 0;
  const isReady = props.isReady || progress === 100;
  const icon = isReady
    ? <CheckCircledIcon className="mr-2 h-4 w-4" />
    : <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />;

  return <div className="flex py-2 items-center">
    { icon }
    { props.status }
    { (!isReady && props.progress !== undefined)
      && <span className="ml-1">- {round(progress)}%</span> }
  </div>;
}

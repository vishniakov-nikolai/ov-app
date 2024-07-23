import React from 'react';
import { useAppContext } from '../providers/app-context';

export default function Footer() {
  const { ovInfo } = useAppContext();

  return (
    <React.Fragment>
      <footer>
        <div className="text-center mono text-sm">
          OpenVINO v.{ovInfo.CPU?.buildNumber}
        </div>
      </footer>
    </React.Fragment>
  );
}

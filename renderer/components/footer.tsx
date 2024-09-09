import { useAppContext } from '../providers/app-context';

export default function Footer({ className } = { className: '' }) {
  const { ovInfo } = useAppContext();

  return (
    <footer className={ 'p-5 ' + className }>
      <div className="text-center mono text-sm">
        OpenVINO v.{ovInfo.CPU?.buildNumber}
      </div>
    </footer>
  );
}

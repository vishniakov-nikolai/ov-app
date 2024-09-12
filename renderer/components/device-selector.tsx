import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from '../components/ui/select';
import { useAppContext } from '../providers/app-context';

export default function DeviceSelector({ setSelectedDevice, defaultDevice = 'CPU' }) {
  const { availableDevices } = useAppContext();

  return <Select
    defaultValue={defaultDevice}
    onValueChange={setSelectedDevice}
  >
    <SelectTrigger className="w-100">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="AUTO">AUTO</SelectItem>
      {availableDevices.map((d, idx) =>
        <SelectItem key={idx} value={d}>{d}</SelectItem>)}
    </SelectContent>
  </Select>;
}

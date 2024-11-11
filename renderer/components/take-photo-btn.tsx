import { Button } from './ui/button';
import { CameraIcon } from 'lucide-react';

import { BE } from '../../constants';

export default function TakePhotoBtn() {
  return <Button
    variant="outline"
    onClick={() => window.ipc.send(BE.START.OV.TAKE_PHOTO)}
    className="mr-2">
    <CameraIcon className="w-6 h-6 mr-2" />
    <span>Take Photo</span>
  </Button>;
}

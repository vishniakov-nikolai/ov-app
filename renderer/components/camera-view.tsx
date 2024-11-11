import { Button } from './ui/button';
import { BE } from '../../constants';
import { CameraIcon, RefreshCcw, SaveIcon } from 'lucide-react';

const { useRef, useEffect, useState } = require('react');

type CameraViewProps = {
  deviceId: string,
};

export default function CameraView(props: CameraViewProps) {
  const { deviceId } = props;
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {
          deviceId: deviceId, width: 640, height: 480 } });

        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing webcam: ', err);
      }
    };

    getVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();

        tracks.forEach(track => track.stop());
      }
    };
  }, [deviceId]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/png');

      setCapturedImage(imageData);
    }
  };

  return <>
    <div className="flex gap-2">
      { !capturedImage &&
        <Button
          onClick={captureImage}
        >
          <CameraIcon className="w-6 h-6 mr-2" />
          <span>Take a photo</span>
        </Button>}
      {capturedImage && <>
        <Button
          variant="secondary"
          onClick={() => setCapturedImage(null)}
        >
          <RefreshCcw className="w-6 h-6 mr-2" />
          <span>Retake</span>
        </Button>
        <Button
          onClick={() => {
            window.ipc.send(BE.START.SAVE_IMAGE, { data: capturedImage });
          }}
        >
          <SaveIcon className="w-6 h-6 mr-2" />
          <span>Use Photo</span>
        </Button>
        </>}
    </div>
    <div className="w-[640px] h-[480px] border border-black relative mt-4">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover top-0 left-0 absolute" />
      {capturedImage && (
        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover top-0 left-0 absolute" />
      )}
    </div>

    <canvas ref={canvasRef} style={{ display: 'none' }} />
  </>;
}

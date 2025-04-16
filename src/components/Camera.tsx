import { Button } from "./ui/button";
import deepar from "deepar";
interface CameraProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  permissionGranted: boolean;
  isInitializing: boolean;
  deepARRef: React.RefObject<deepar.DeepAR>;
}

    const Camera = ({
    canvasRef,
    isRecording,
    startRecording,
    stopRecording,
    permissionGranted,
    isInitializing,
    deepARRef,
  }: CameraProps) => {
    return (
      <div className="flex flex-col items-center">
        {/* Camera Preview */}
        <div className="relative mb-6 w-full">
          <canvas
            ref={canvasRef}
            className="w-full aspect-video rounded-2xl shadow-medium border border-border"
            width={1280}
            height={720}
          />
  
          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center shadow-medium">
              <div className="w-3 h-3 rounded-full bg-white mr-2 animate-pulse" />
              Recording...
            </div>
          )}
        </div>
  
        {/* Record Button */}
        <div className="flex justify-center items-center mt-4 mb-8">
          <Button
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            disabled={!permissionGranted || isInitializing || !deepARRef.current}
            variant="accent"
            size="lg"
            className={`${
              isRecording ? "bg-red-500 hover:bg-red-600" : ""
            } h-16 w-16 rounded-full transition-all duration-300 shadow-large`}
          >
            <span className="sr-only">
              {isRecording ? "Stop Recording" : "Start Recording"}
            </span>
            <div
              className={`${
                isRecording ? "h-6 w-6" : "h-5 w-5"
              } rounded-sm bg-white transition-all duration-300`}
            />
          </Button>
          <p className="absolute mt-28 text-sm text-muted-foreground">
            Press and hold to record
          </p>
        </div>
      </div>
    );
  };

export default Camera;
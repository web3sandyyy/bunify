import React, { useEffect, useState } from "react";
import * as deepar from "deepar";
import { Button } from "./ui/button";




interface CameraProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  permissionGranted: boolean;
  isInitializing: boolean;
  deepARRef: React.RefObject<deepar.DeepAR | null>;
}


function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
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
  const { width, height } = useWindowSize();
  return (
    <div className="">
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          className="w-full !min-h-full rounded-2xl shadow-medium border border-border"
          width={width }
          height={height - 72}
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center ">
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
      </div>
    </div>
  );
};

export default Camera;

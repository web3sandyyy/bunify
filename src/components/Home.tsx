import { useEffect, useRef, useState } from "react";
import * as deepar from "deepar";

const Home = () => {
  const licenseKey = import.meta.env.VITE_DEEPAR_LICENSE_KEY;
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const deepARRef = useRef<deepar.DeepAR | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initialize();

    return () => {
      // Cleanup DeepAR when component unmounts
      if (deepARRef.current) {
        deepARRef.current.shutdown();
      }
    };
  }, []);

  const initialize = async () => {
    if (!canvasRef.current) return;

    try {
      // Initialize DeepAR with the canvas element
      deepARRef.current = await deepar.initialize({
        licenseKey: licenseKey,
        canvas: canvasRef.current,
        effect: "https://cdn.jsdelivr.net/npm/deepar/effects/aviators",
      });

      // Start camera
      await deepARRef.current.startCamera();

      console.log("DeepAR initialized successfully");
    } catch (error) {
      console.error("Failed to initialize DeepAR:", error);
    }
  };

  const startRecording = async () => {
    if (!deepARRef.current) return;

    try {
      setIsRecording(true);
      setVideoUrl(null);
      await deepARRef.current.startVideoRecording();
      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!deepARRef.current || !isRecording) return;

    try {
      const videoDataUrl = await deepARRef.current.finishVideoRecording();

      // Handle the blob data and create a URL from it
      if (videoDataUrl instanceof Blob) {
        const url = URL.createObjectURL(videoDataUrl);
        setVideoUrl(url);
      } else if (typeof videoDataUrl === "string") {
        setVideoUrl(videoDataUrl);
      }

      setIsRecording(false);
      console.log("Recording stopped");
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-full w-full p-2">
      <canvas
        ref={canvasRef}
        className="w-full min-h-[60vh] border-2 border-black rounded-lg object-cover"
        width={1280}
        height={720}
      />

      {videoUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Recorded Video</h3>
          <video src={videoUrl} controls className="w-full border rounded-lg" />
        </div>
      )}

      <div className="flex justify-center items-center w-full mt-4">
        <button
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          className={`${
            isRecording ? "bg-red-500" : "bg-blue-500"
          } p-6 rounded-full transition-all duration-100 flex items-center justify-center`}
        >
          <span className="text-white font-bold">
            {isRecording ? "Recording..." : "Hold to Record"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Home;

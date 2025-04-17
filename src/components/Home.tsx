import { useEffect, useRef, useState } from "react";
import * as deepar from "deepar";
import { uploadAndSaveMedia } from "../lib/supabase";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { SplashScreen } from "./SplashScreen";
import ErrorBanner from "./ErrorBanner";
import Header from "./Header";
import Camera from "./Camera";
import Filters from "./Filters";
import VideoPreview from "./VideoPreview";
import { useSplashScreen } from "../context/SplashScreenContext";

// Main Home Component
const Home = () => {
  const licenseKey = import.meta.env.VITE_DEEPAR_LICENSE_KEY;
  const { hasSeenSplash, setHasSeenSplash } = useSplashScreen();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const deepARRef = useRef<deepar.DeepAR | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string>("");
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(!hasSeenSplash);

  // Handle splash screen
  const handleSplashComplete = () => {
    setShowSplash(false);
    setHasSeenSplash(true);
    // We wait for splash to complete before initializing camera
    checkCameraPermission();
  };

  useEffect(() => {
    // If we've already seen the splash, initialize the camera directly
    if (hasSeenSplash) {
      checkCameraPermission();
    }

    return () => {
      // Cleanup DeepAR when component unmounts
      if (deepARRef.current) {
        deepARRef.current.shutdown();
      }
      // Clean up any video URLs
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [hasSeenSplash]);

  // When permission state changes, initialize DeepAR if granted
  useEffect(() => {
    if (permissionGranted && !deepARRef.current && !isInitializing) {
      initialize();
    }
  }, [permissionGranted]);

  const checkCameraPermission = async () => {
    try {
      // Check if permissions are already granted
      const permissionStatus = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });

      if (permissionStatus.state === "granted") {
        // Permission already granted, proceed with initialization
        setPermissionGranted(true);
        setPermissionError(null);
        setPermissionChecked(true);
      } else if (permissionStatus.state === "prompt") {
        // Will need to ask for permission
        setPermissionChecked(true);
        requestCameraPermission();
      } else {
        // Permission denied
        setPermissionGranted(false);
        setPermissionError(
          "Camera access denied. Please allow camera access in your browser settings."
        );
        setPermissionChecked(true);
      }
    } catch (error) {
      // Permissions API not supported or other error
      // Fallback to requesting permission directly
      console.log("Permission check failed, requesting directly:", error);
      requestCameraPermission();
    }
  };

  const requestCameraPermission = async () => {
    try {
      setIsInitializing(true);
      // Explicitly request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // If we get here, permission was granted
      setPermissionGranted(true);
      setPermissionError(null);
      setPermissionChecked(true);

      // Stop the test stream since DeepAR will create its own
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Camera permission denied:", error);
      setPermissionGranted(false);
      setPermissionChecked(true);
      setPermissionError(
        "Camera access denied. Please allow camera access to use AR features."
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const initialize = async () => {
    if (!canvasRef.current || !permissionGranted || isInitializing) return;

    try {
      setIsInitializing(true);
      console.log("Initializing DeepAR...");

      // Initialize DeepAR with the canvas element (no initial effect)
      deepARRef.current = await deepar.initialize({
        licenseKey: licenseKey,
        canvas: canvasRef.current,
        additionalOptions: {
          cameraConfig: {
            // Ensure we're using the front camera
            facingMode: "user",
          },
        },
      });

      // Start camera with specific constraints for Android compatibility
      await deepARRef.current.startCamera({
        mediaStreamConstraints: {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        },
      });

      console.log("DeepAR initialized successfully");
    } catch (error) {
      console.error("Failed to initialize DeepAR:", error);
      // If initialization fails, we might need to check permissions again
      setPermissionGranted(false);
      setPermissionError("Failed to initialize AR features. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const switchFilter = async (filterPath: string) => {
    if (!deepARRef.current) return;

    try {
      setFilterError(null);

      if (!filterPath) {
        // If empty path, remove filter
        await deepARRef.current.clearEffect();
        setCurrentFilter("");
        return;
      }

      console.log(`Switching to filter: ${filterPath}`);
      await deepARRef.current.switchEffect(filterPath);
      setCurrentFilter(filterPath);
    } catch (error) {
      console.error("Failed to switch filter:", error);
      setFilterError(`Failed to load filter: ${filterPath}`);
    }
  };

  const startRecording = async () => {
    if (!deepARRef.current) return;

    try {
      setIsRecording(true);
      setVideoUrl(null);
      setVideoBlob(null);
      setUploadedUrl(null);
      setSaveSuccess(false);
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
      const videoData = await deepARRef.current.finishVideoRecording();

      // Handle the blob data and create a URL from it
      if (videoData instanceof Blob) {
        const url = URL.createObjectURL(videoData);
        setVideoUrl(url);
        setVideoBlob(videoData);
      } else if (typeof videoData === "string") {
        setVideoUrl(videoData);
        // Try to fetch the data URL and convert to blob
        try {
          const response = await fetch(videoData);
          const blob = await response.blob();
          setVideoBlob(blob);
        } catch (error) {
          console.error("Failed to convert data URL to blob:", error);
        }
      }

      setIsRecording(false);
      console.log("Recording stopped");
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setIsRecording(false);
    }
  };

  const handleSaveVideo = async () => {
    if (!videoBlob) {
      setSaveError("No video to save");
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Upload video blob to Supabase storage and save reference in DB
      const { data, error } = await uploadAndSaveMedia(videoBlob, "video");

      if (error) {
        setSaveError(error.message);
      } else if (data) {
        setSaveSuccess(true);
        setUploadedUrl(data.file_url);
      }
    } catch (error) {
      console.error("Error saving video:", error);
      setSaveError("Failed to save video");
    } finally {
      setIsSaving(false);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="h-[100dvh] bg-background">
      <Header />

      <main className="mx-auto p-4 ">
        {permissionChecked && !permissionGranted && permissionError && (
          <ErrorBanner
            error={permissionError}
            actionButton={
              <Button
                onClick={requestCameraPermission}
                variant="secondary"
                size="sm"
              >
                Request Camera Permission
              </Button>
            }
          />
        )}

        {/* Filter Error Banner */}
        {filterError && (
          <ErrorBanner
            error={filterError}
            onDismiss={() => setFilterError(null)}
          />
        )}

        {/* Loading Overlay */}
        {isInitializing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-card p-6 rounded-xl shadow-medium flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-accent animate-spin mb-2" />
              <p className="text-foreground font-medium">
                Initializing camera...
              </p>
            </div>
          </div>
        )}

        <Camera
          canvasRef={canvasRef}
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          permissionGranted={permissionGranted}
          isInitializing={isInitializing}
          deepARRef={deepARRef}
        />

        <Filters
          currentFilter={currentFilter}
          switchFilter={switchFilter}
          deepARRef={deepARRef}
          isInitializing={isInitializing}
        />

        <VideoPreview
          videoUrl={videoUrl}
          videoBlob={videoBlob}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          saveError={saveError}
          uploadedUrl={uploadedUrl}
          handleSaveVideo={handleSaveVideo}
        />
      </main>
    </div>
  );
};

export default Home;

import { useEffect, useRef, useState } from "react";
import * as deepar from "deepar";
import filters from "../constants/filters";
import { useAuth } from "../context/AuthContext";
import { uploadAndSaveMedia } from "../lib/supabase";
import {
  Camera,
  Upload,
  LogOut,
  Image as ImageIcon,
  Video,
  User,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { SplashScreen } from "./SplashScreen";
import Gallery from "./Gallery";

const Home = () => {
  const licenseKey = import.meta.env.VITE_DEEPAR_LICENSE_KEY;
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
  const [showSplash, setShowSplash] = useState(true);
  const [showGallery, setShowGallery] = useState(false);

  const { user, logout } = useAuth();

  // Handle splash screen
  const handleSplashComplete = () => {
    setShowSplash(false);
    // We wait for splash to complete before initializing camera
    checkCameraPermission();
  };

  useEffect(() => {
    // The splash screen will trigger camera permission check when it completes
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
  }, []);

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

  const handleLogout = async () => {
    await logout();
    // Redirect will happen automatically via ProtectedRoute
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-card shadow-medium p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <Camera className="mr-2 h-6 w-6 text-accent" />
            Bunify
          </h1>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center bg-muted rounded-full px-3 py-1 text-sm">
                <User className="h-4 w-4 mr-2 text-accent" />
                <span className="text-foreground">{user.email}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGallery(true)}
              className="rounded-full"
              title="Gallery"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        {/* Permission Error Banner */}
        {permissionChecked && !permissionGranted && permissionError && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
            <p className="mb-2">{permissionError}</p>
            <Button
              onClick={requestCameraPermission}
              variant="secondary"
              size="sm"
            >
              Request Camera Permission
            </Button>
          </div>
        )}

        {/* Filter Error Banner */}
        {filterError && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4 flex justify-between items-center">
            <p>{filterError}</p>
            <Button
              onClick={() => setFilterError(null)}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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

        {/* Camera Preview */}
        <div className="relative mb-6">
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

        {/* Filter Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-foreground">
            Filters
          </h3>
          <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2 bg-muted/30 rounded-xl">
            {filters.map((filter, index) => (
              <Button
                key={index}
                onClick={() => switchFilter(filter.path)}
                disabled={!deepARRef.current || isInitializing}
                variant={currentFilter === filter.path ? "accent" : "outline"}
                size="sm"
                className="font-medium"
              >
                {filter.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Recorded Video Preview */}
        {videoUrl && (
          <div className="mb-6 bg-card rounded-xl shadow-medium overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Video className="mr-2 h-5 w-5 text-accent" />
                Recorded Video
              </h3>
              <Button
                onClick={handleSaveVideo}
                disabled={isSaving || saveSuccess || !videoBlob}
                variant={saveSuccess ? "secondary" : "accent"}
                size="sm"
                className="shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : saveSuccess ? (
                  "Saved!"
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>

            {saveError && (
              <div className="bg-destructive/10 border-x border-b border-destructive text-destructive p-3">
                <p className="text-sm">{saveError}</p>
              </div>
            )}

            {uploadedUrl && (
              <div className="bg-green-50 border-x border-b border-green-200 p-3">
                <p className="text-sm text-green-800">
                  Video uploaded successfully!
                </p>
                <p className="text-xs text-green-700 truncate mt-1 overflow-hidden">
                  Saved at:{" "}
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {uploadedUrl}
                  </a>
                </p>
              </div>
            )}

            <div className="p-4">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg border border-muted"
              />
            </div>
          </div>
        )}

        {/* Record Button */}
        <div className="flex justify-center items-center mt-4 mb-8">
          <Button
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            disabled={
              !permissionGranted || isInitializing || !deepARRef.current
            }
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
      </main>

      {/* Gallery Modal */}
      {showGallery && <Gallery onClose={() => setShowGallery(false)} />}
    </div>
  );
};

export default Home;

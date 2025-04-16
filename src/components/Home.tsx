import { useEffect, useRef, useState } from "react";
import * as deepar from "deepar";
import filters from "../constants/filters";
import { useAuth } from "../context/AuthContext";
import { uploadAndSaveMedia } from "../lib/supabase";

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

  const { user, logout } = useAuth();

  useEffect(() => {
    // Check for camera permissions first before doing anything
    checkCameraPermission();

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

  return (
    <div className="min-h-full w-full p-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Filterly</h1>
        <div className="flex items-center gap-2">
          {user && <span className="text-sm">{user.email}</span>}
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </div>

      {permissionChecked && !permissionGranted && permissionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{permissionError}</p>
          <button
            onClick={requestCameraPermission}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
          >
            Request Camera Permission
          </button>
        </div>
      )}

      {filterError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>{filterError}</p>
          <button
            onClick={() => setFilterError(null)}
            className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-lg">Initializing camera...</p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full min-h-[60vh] border-2 border-black rounded-lg object-cover"
        width={1280}
        height={720}
      />

      {/* Filter Selection */}
      <div className="mt-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Choose a Filter</h3>
        <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2">
          {filters.map((filter, index) => (
            <button
              key={index}
              onClick={() => switchFilter(filter.path)}
              disabled={!deepARRef.current || isInitializing}
              className={`px-3 py-2 rounded-lg text-sm ${
                currentFilter === filter.path
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              } ${
                !deepARRef.current || isInitializing
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {videoUrl && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Recorded Video</h3>
            <button
              onClick={handleSaveVideo}
              disabled={isSaving || saveSuccess || !videoBlob}
              className={`px-4 py-2 rounded ${
                saveSuccess
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } ${
                isSaving || !videoBlob ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSaving
                ? "Uploading..."
                : saveSuccess
                ? "Saved!"
                : "Upload to Media"}
            </button>
          </div>

          {saveError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{saveError}</p>
            </div>
          )}

          {uploadedUrl && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>Video uploaded successfully!</p>
              <p className="text-xs truncate mt-1">
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

          <video src={videoUrl} controls className="w-full border rounded-lg" />
        </div>
      )}

      <div className="flex justify-center items-center w-full mt-4">
        <button
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          disabled={!permissionGranted || isInitializing || !deepARRef.current}
          className={`${
            isRecording ? "bg-red-500" : "bg-blue-500"
          } p-6 rounded-full transition-all duration-100 flex items-center justify-center ${
            !permissionGranted || isInitializing || !deepARRef.current
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
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

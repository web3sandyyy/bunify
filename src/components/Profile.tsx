import { useEffect, useState, useRef, RefObject } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserMedia, uploadReel, getUserReels } from "../lib/supabase";
import { Link } from "react-router-dom";
import { toast } from "./ui/use-toast";
import { Button } from "./ui/button";

// Component imports
import UserInfoCard from "./profile/UserInfoCard";
import ReelsGrid from "./profile/ReelsGrid";
import ReelUploadDialog from "./profile/ReelUploadDialog";
import ReelViewDialog from "./profile/ReelViewDialog";
import ErrorBanner from "./profile/ErrorBanner";
import Gallery from "./Gallery";

// Maximum duration for reels in seconds
const MAX_REEL_DURATION = 60;

interface Reel {
  id: number;
  user_email: string;
  video_url: string;
  uploaded_at: string;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const [mediaCount, setMediaCount] = useState({
    total: 0,
    images: 0,
    videos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reelDialogOpen, setReelDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [reelsCount, setReelsCount] = useState(0);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [reelViewDialogOpen, setReelViewDialogOpen] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(
    null
  ) as RefObject<HTMLVideoElement>;

  useEffect(() => {
    fetchMediaStats();
    fetchReels();
  }, []);

  const fetchMediaStats = async () => {
    try {
      setLoading(true);
      const { data, error: mediaError } = await getUserMedia();

      if (mediaError) {
        setError(mediaError.message);
      } else if (data) {
        const images = data.filter((item) => item.file_type === "image");
        const videos = data.filter((item) => item.file_type === "video");

        setMediaCount({
          total: data.length,
          images: images.length,
          videos: videos.length,
        });
      }
    } catch (fetchError) {
      setError("Failed to load media information");
      console.error("Profile error:", fetchError);
    } finally {
      setLoading(false);
    }
  };

  const fetchReels = async () => {
    try {
      setReelsLoading(true);
      const { data, error: reelsError } = await getUserReels();
      if (reelsError) {
        console.error("Error fetching reels:", reelsError);
        setError(reelsError.message);
      } else if (data) {
        setReels(data);
        setReelsCount(data.length);
      }
    } catch (fetchError) {
      console.error("Failed to fetch reels:", fetchError);
      setError("Failed to fetch reels");
    } finally {
      setReelsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setSelectedVideo(file);
    const videoUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(videoUrl);

    // Check video duration
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = function () {
      URL.revokeObjectURL(videoUrl);
      if (video.duration > MAX_REEL_DURATION) {
        toast({
          title: "Video too long",
          description: `Reels must be under 1 minute. Your video is ${Math.floor(
            video.duration
          )} seconds.`,
          variant: "destructive",
        });
        setSelectedVideo(null);
        setVideoPreviewUrl(null);
      } else {
        setReelDialogOpen(true);
      }
    };
    video.src = videoUrl;
  };

  const uploadVideoReel = async () => {
    if (!selectedVideo) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      const { error: uploadError } = await uploadReel(selectedVideo);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reel uploaded",
          description: "Your reel has been uploaded successfully",
        });

        // Refresh reels list
        fetchReels();

        // Close dialog after a delay to show 100% progress
        setTimeout(() => {
          setReelDialogOpen(false);
          setSelectedVideo(null);
          setVideoPreviewUrl(null);
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedVideo(null);
    setVideoPreviewUrl(null);
    setReelDialogOpen(false);
  };

  const openReelView = (reel: Reel) => {
    setSelectedReel(reel);
    setReelViewDialogOpen(true);
  };

  const closeReelView = () => {
    setSelectedReel(null);
    setReelViewDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-2 sm:py-4 max-w-4xl">
        <div className="mb-4 sm:mb-8 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            My Profile
          </h1>
          <Link to="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>

        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        <UserInfoCard
          user={user}
          mediaCount={mediaCount}
          reelsCount={reelsCount}
          loading={loading}
          onLogout={handleLogout}
          onUploadClick={openFileDialog}
        />

        {/* Hidden file input for reel upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          className="hidden"
        />

        {/* Gallery Section */}
        <div className="mt-6 sm:mt-10">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-6">
            My Gallery
          </h2>
          <div className="bg-card rounded-xl shadow-medium overflow-hidden">
            <Gallery onClose={() => {}} standalone={true} />
          </div>
        </div>

        {/* Reels Section */}
        <div className="mt-6 sm:mt-10 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-6">
            My Reels
          </h2>
          <ReelsGrid
            reels={reels}
            reelsLoading={reelsLoading}
            onReelClick={openReelView}
            onUploadClick={openFileDialog}
          />
        </div>

        {/* Dialogs */}
        <ReelUploadDialog
          open={reelDialogOpen}
          onOpenChange={setReelDialogOpen}
          videoPreviewUrl={videoPreviewUrl}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          videoRef={videoRef}
          onCancel={cancelUpload}
          onUpload={uploadVideoReel}
          uploadDisabled={!selectedVideo || isUploading}
        />

        <ReelViewDialog
          open={reelViewDialogOpen}
          onOpenChange={setReelViewDialogOpen}
          selectedReel={selectedReel}
          onClose={closeReelView}
        />
      </div>
    </div>
  );
};

export default Profile;

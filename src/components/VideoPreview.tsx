import { Button } from "./ui/button";
import { Video, Loader2, Upload } from "lucide-react";

interface VideoPreviewProps {
  videoUrl: string | null;
  videoBlob: Blob | null;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
    uploadedUrl: string | null;
    handleSaveVideo: () => Promise<void>;
}

const VideoPreview = ({
  videoUrl,
    videoBlob,
    isSaving,
    saveSuccess,
    saveError,
    uploadedUrl,
    handleSaveVideo,
  }: VideoPreviewProps) => {
    if (!videoUrl) return null;
  
    return (
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
            <p className="text-sm text-green-800">Video uploaded successfully!</p>
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
  );
};

export default VideoPreview;

import { RefObject } from "react";
import { X, Loader2, Upload } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface ReelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoPreviewUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  videoRef: RefObject<HTMLVideoElement>;
  onCancel: () => void;
  onUpload: () => void;
  uploadDisabled: boolean;
}

const ReelUploadDialog = ({
  open,
  onOpenChange,
  videoPreviewUrl,
  isUploading,
  uploadProgress,
  videoRef,
  onCancel,
  onUpload,
  uploadDisabled,
}: ReelUploadDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Upload Reel</DialogTitle>
          <DialogDescription>
            Preview your reel before uploading
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          {videoPreviewUrl && (
            <div className="relative bg-black rounded-md overflow-hidden aspect-[9/16] mx-auto max-w-[250px]">
              <video
                ref={videoRef}
                src={videoPreviewUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                muted
                loop
              />
            </div>
          )}

          {isUploading && (
            <div className="mt-4">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center mt-2">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isUploading}
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={onUpload}
              disabled={uploadDisabled}
              className="bg-accent hover:bg-accent/80"
              size="sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Reel
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReelUploadDialog;

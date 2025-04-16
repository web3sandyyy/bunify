import { Film, Loader2, Play, Upload } from "lucide-react";
import { Button } from "../ui/button";

interface Reel {
  id: number;
  user_email: string;
  video_url: string;
  uploaded_at: string;
}

interface ReelsGridProps {
  reels: Reel[];
  reelsLoading: boolean;
  onReelClick: (reel: Reel) => void;
  onUploadClick: () => void;
}

const ReelsGrid = ({
  reels,
  reelsLoading,
  onReelClick,
  onUploadClick,
}: ReelsGridProps) => {
  if (reelsLoading) {
    return (
      <div className="flex justify-center items-center p-10 bg-card rounded-xl shadow-medium">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-medium p-6 sm:p-10 text-center">
        <Film className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Reels Yet
        </h3>
        <p className="text-muted-foreground mb-4">
          Upload your first reel to get started!
        </p>
        <Button
          onClick={onUploadClick}
          className="bg-accent hover:bg-accent/80"
          size="sm"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Reel
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-medium p-4 sm:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="relative rounded-md overflow-hidden aspect-[9/16] bg-black cursor-pointer group"
            onClick={() => onReelClick(reel)}
          >
            <video
              src={reel.video_url}
              className="w-full h-full object-cover"
              muted
              playsInline
              onMouseOver={(e) => e.currentTarget.play()}
              onMouseOut={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-xs text-white">
                {new Date(reel.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelsGrid;

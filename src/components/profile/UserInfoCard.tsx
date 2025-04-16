import {
  User,
  Mail,
  Film,
  Image as ImageIcon,
  Video,
  Upload,
} from "lucide-react";
import { Button } from "../ui/button";

interface UserInfoCardProps {
  user: { email?: string } | null;
  mediaCount: {
    total: number;
    images: number;
    videos: number;
  };
  reelsCount: number;
  loading: boolean;
  onLogout: () => Promise<void>;
  onUploadClick: () => void;
}

const UserInfoCard = ({
  user,
  mediaCount,
  reelsCount,
  loading,
  onLogout,
  onUploadClick,
}: UserInfoCardProps) => {
  return (
    <div className="bg-card rounded-xl shadow-medium p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center">
          <User className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold">
              {user?.email?.split("@")[0] || "User"}
            </h2>
            <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">
                {user?.email || "Not signed in"}
              </span>
            </div>
          </div>

          {/* Media Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg flex items-center">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-accent" />
              <div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Total Media
                </p>
                <p className="text-base sm:text-lg font-medium">
                  {loading ? "..." : mediaCount.total}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg flex items-center">
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-accent" />
              <div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Images
                </p>
                <p className="text-base sm:text-lg font-medium">
                  {loading ? "..." : mediaCount.images}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg flex items-center">
              <Video className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-accent" />
              <div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Videos
                </p>
                <p className="text-base sm:text-lg font-medium">
                  {loading ? "..." : mediaCount.videos}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg flex items-center">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-accent" />
              <div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Reels
                </p>
                <p className="text-base sm:text-lg font-medium">{reelsCount}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              className="w-full sm:w-auto bg-accent hover:bg-accent/80"
              onClick={onUploadClick}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Reel
            </Button>

            <Button
              variant="destructive"
              onClick={onLogout}
              className="w-full sm:w-auto"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;

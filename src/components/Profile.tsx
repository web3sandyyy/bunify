import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserMedia } from "../lib/supabase";
import { User, Mail, Video, Image as ImageIcon, Film } from "lucide-react";
import { Button } from "./ui/button";
import Gallery from "./Gallery";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const [mediaCount, setMediaCount] = useState({
    total: 0,
    images: 0,
    videos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMediaStats();
  }, []);

  const fetchMediaStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await getUserMedia();

      if (error) {
        setError(error.message);
      } else if (data) {
        const images = data.filter((item) => item.file_type === "image");
        const videos = data.filter((item) => item.file_type === "video");

        setMediaCount({
          total: data.length,
          images: images.length,
          videos: videos.length,
        });
      }
    } catch (error) {
      setError("Failed to load media information");
      console.error("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Redirect will happen automatically via ProtectedRoute
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <Link to="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* User Info Card */}
        <div className="bg-card rounded-xl shadow-medium p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-xl font-semibold">
                  {user?.email?.split("@")[0] || "User"}
                </h2>
                <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{user?.email || "Not signed in"}</span>
                </div>
              </div>

              {/* Media Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg flex items-center">
                  <Film className="h-5 w-5 mr-3 text-accent" />
                  <div>
                    <p className="text-muted-foreground text-sm">Total Media</p>
                    <p className="text-lg font-medium">
                      {loading ? "..." : mediaCount.total}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg flex items-center">
                  <ImageIcon className="h-5 w-5 mr-3 text-accent" />
                  <div>
                    <p className="text-muted-foreground text-sm">Images</p>
                    <p className="text-lg font-medium">
                      {loading ? "..." : mediaCount.images}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg flex items-center">
                  <Video className="h-5 w-5 mr-3 text-accent" />
                  <div>
                    <p className="text-muted-foreground text-sm">Videos</p>
                    <p className="text-lg font-medium">
                      {loading ? "..." : mediaCount.videos}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-6">My Gallery</h2>
          <div className="bg-card rounded-xl shadow-medium overflow-hidden">
            <Gallery onClose={() => {}} standalone={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

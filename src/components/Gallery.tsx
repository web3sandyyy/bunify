import { useEffect, useState } from "react";
import { getUserMedia } from "../lib/supabase";
import { Image, FileVideo, Camera, XCircle } from "lucide-react";
import { Button } from "./ui/button";

interface Media {
  id: number;
  user_email: string;
  file_url: string;
  file_type: "image" | "video";
  uploaded_at: string;
}

interface GalleryProps {
  onClose: () => void;
}

const Gallery = ({ onClose }: GalleryProps) => {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    fetchUserMedia();
  }, []);

  const fetchUserMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await getUserMedia();

      if (error) {
        setError(error.message);
      } else if (data) {
        setMediaItems(data);
      }
    } catch (error) {
      setError("Failed to load gallery");
      console.error("Gallery error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-large w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <Camera className="mr-2 h-5 w-5 text-accent" />
            My Gallery
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && mediaItems.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No media found. Record and save something!
              </p>
            </div>
          )}

          {!loading && !error && mediaItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-lg overflow-hidden bg-muted aspect-square cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  {item.file_type === "video" ? (
                    <>
                      <video
                        src={item.file_url}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileVideo className="h-10 w-10 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={item.file_url}
                        alt="Gallery item"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Image className="h-10 w-10 text-white" />
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs truncate transform translate-y-full group-hover:translate-y-0 transition-transform">
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Preview Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] w-full rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.file_type === "video" ? (
              <video
                src={selectedMedia.file_url}
                controls
                autoPlay
                className="w-full h-full max-h-[80vh] bg-black"
              />
            ) : (
              <img
                src={selectedMedia.file_url}
                alt="Selected media"
                className="w-full h-full max-h-[80vh] object-contain bg-black"
              />
            )}
            <div className="bg-card p-4">
              <p className="text-sm">
                Uploaded on{" "}
                {new Date(selectedMedia.uploaded_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            className="absolute top-4 right-4 bg-black/50 rounded-full p-2"
            onClick={() => setSelectedMedia(null)}
          >
            <XCircle className="h-6 w-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;

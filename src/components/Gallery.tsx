import { useEffect, useState } from "react";
import { getUserMedia } from "../lib/supabase";
import {
  Image,
  FileVideo,
  Camera,
  XCircle,
  Download,
  ExternalLink,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface Media {
  id: number;
  user_email: string;
  file_url: string;
  file_type: "image" | "video";
  uploaded_at: string;
}

interface GalleryProps {
  onClose: () => void;
  standalone?: boolean;
}

const Gallery = ({ onClose, standalone = false }: GalleryProps) => {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const handleDownload = (media: Media) => {
    const a = document.createElement("a");
    a.href = media.file_url;
    a.download = media.file_url.split("/").pop() || `bunify-${media.id}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = (media: Media) => {
    navigator.clipboard
      .writeText(media.file_url)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <Camera className="h-10 w-10 text-muted-foreground/70" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        No media found
      </h3>
      <p className="text-muted-foreground max-w-md">
        You haven't recorded or uploaded any videos yet. Start creating content
        to build your gallery!
      </p>
      <Button variant="outline" onClick={onClose} className="mt-8">
        Start Recording
      </Button>
    </div>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4",
        standalone && "relative inset-auto bg-transparent p-0 z-auto"
      )}
    >
      <div
        className={cn(
          "bg-card rounded-xl shadow-large overflow-hidden flex flex-col",
          standalone
            ? "w-full h-full max-h-full"
            : "w-full max-w-4xl max-h-[90vh]"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <Camera className="mr-2 h-5 w-5 text-accent" />
            My Gallery
          </h2>
          {!standalone && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error loading gallery</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && mediaItems.length === 0 && <EmptyState />}

          {!loading && !error && mediaItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-lg overflow-hidden bg-muted aspect-square cursor-pointer hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-background transition-all duration-200"
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
          className={cn(
            "fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4",
            isFullscreen ? "fixed inset-0" : ""
          )}
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className={cn(
              "relative max-w-5xl max-h-[90vh] w-full rounded-lg overflow-hidden",
              isFullscreen
                ? "w-screen max-w-none h-screen max-h-none rounded-none"
                : ""
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                className="bg-black/50 hover:bg-black/70 rounded-full p-2"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyLink(selectedMedia);
                }}
                title="Copy link"
              >
                {copySuccess ? (
                  <ClipboardCheck className="h-5 w-5 text-white" />
                ) : (
                  <ExternalLink className="h-5 w-5 text-white" />
                )}
              </Button>
              <Button
                className="bg-black/50 hover:bg-black/70 rounded-full p-2"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedMedia);
                }}
                title="Download"
              >
                <Download className="h-5 w-5 text-white" />
              </Button>
              <Button
                className="bg-black/50 hover:bg-black/70 rounded-full p-2"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white"
                >
                  {isFullscreen ? (
                    <>
                      <polyline points="4 14 10 14 10 20" />
                      <polyline points="20 10 14 10 14 4" />
                      <line x1="14" y1="10" x2="21" y2="3" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </>
                  ) : (
                    <>
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </>
                  )}
                </svg>
              </Button>
              <Button
                className="bg-black/50 hover:bg-black/70 rounded-full p-2"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedMedia(null)}
                title="Close"
              >
                <XCircle className="h-5 w-5 text-white" />
              </Button>
            </div>

            {selectedMedia.file_type === "video" ? (
              <video
                src={selectedMedia.file_url}
                controls
                autoPlay
                className={cn(
                  "w-full h-full max-h-[80vh] bg-black object-contain",
                  isFullscreen ? "max-h-screen" : "max-h-[80vh]"
                )}
              />
            ) : (
              <img
                src={selectedMedia.file_url}
                alt="Selected media"
                className={cn(
                  "w-full h-full max-h-[80vh] object-contain bg-black",
                  isFullscreen ? "max-h-screen" : "max-h-[80vh]"
                )}
              />
            )}

            {!isFullscreen && (
              <div className="bg-card p-4">
                <p className="text-sm">
                  Uploaded on{" "}
                  {new Date(selectedMedia.uploaded_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {copySuccess && (
        <div className="fixed bottom-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-md shadow-lg z-[70] animate-in fade-in slide-in-from-bottom-5">
          <p className="flex items-center">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Link copied to clipboard!
          </p>
        </div>
      )}
    </div>
  );
};

export default Gallery;

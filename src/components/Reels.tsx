import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllReels } from "../lib/supabase";
import { Loader2, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import Header from "./Header";

interface Reel {
  id: number;
  user_email: string;
  video_url: string;
  uploaded_at: string;
}

const Reels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // Refs for the container and videos
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollingRef = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch reels on initial load
  useEffect(() => {
    fetchReels();
  }, []);

  // Set up intersection observer to detect which reel is currently visible
  useEffect(() => {
    if (!reels.length) return;

    // Clean up any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create a new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;

        entries.forEach((entry) => {
          const reelId = entry.target.getAttribute("data-reel-id");
          if (!reelId) return;

          const reelIndex = reels.findIndex(
            (reel) => reel.id.toString() === reelId
          );
          if (reelIndex === -1 || !videoRefs.current[reelIndex]) return;

          const video = videoRefs.current[reelIndex];

          if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
            // If this is the most visible video, play it and update URL
            if (reelId !== id) {
              navigate(`/reel/${reelId}`, { replace: true });
            }

            // Unmute and play the video
            video.muted = false;
            video.play().catch((e) => {
              console.error("Could not play video:", e);
              // Fallback to muted autoplay which has better browser support
              video.muted = true;
              video
                .play()
                .catch((err) =>
                  console.error("Could not play muted video:", err)
                );
            });
          } else {
            // Pause videos that are not in view
            video.pause();
            video.muted = true;
          }
        });
      },
      { threshold: [0.1, 0.3, 0.5, 0.7, 1] }
    );

    // Observe all reel containers
    const reelElements = document.querySelectorAll(".reel-container");
    reelElements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [reels, navigate, id]);

  // Handle scroll events to mark when scrolling is happening
  useEffect(() => {
    const handleScroll = () => {
      scrollingRef.current = true;

      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set a timeout to mark scrolling as complete
      scrollTimeout.current = setTimeout(() => {
        scrollingRef.current = false;
      }, 100);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Scroll to the current reel based on ID in URL
  useEffect(() => {
    if (!reels.length || !id || scrollingRef.current) return;

    const reelIndex = reels.findIndex((reel) => reel.id.toString() === id);
    if (reelIndex !== -1) {
      const reelElement = document.querySelector(`[data-reel-id="${id}"]`);
      if (reelElement) {
        reelElement.scrollIntoView({ behavior: "smooth" });
      }
    } else if (reels.length > 0) {
      // If ID is invalid, navigate to the first reel
      navigate(`/reel/${reels[0].id}`, { replace: true });
    }
  }, [reels, id, navigate]);

  const fetchReels = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getAllReels();

      if (error) {
        setError(error.message);
      } else if (data && data.length > 0) {
        setReels(data);

        // Initialize videoRefs array with the correct length
        videoRefs.current = new Array(data.length);

        // If no current reel ID or invalid ID, navigate to the first reel
        if (!id || !data.some((reel) => reel.id.toString() === id)) {
          navigate(`/reel/${data[0].id}`, { replace: true });
        }
      }
    } catch (err) {
      setError("Failed to load reels. Please try again later.");
      console.error("Error in fetchReels:", err);
    } finally {
      setLoading(false);
    }
  };

  const showTooltip = (reelId: number) => {
    setActiveTooltip(reelId);

    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }

    tooltipTimeout.current = setTimeout(() => {
      setActiveTooltip(null);
    }, 1500);
  };

  // Clean up tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
    };
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col items-center overflow-hidden">
        {loading && reels.length === 0 ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="w-full max-w-md p-4 text-center">
            <p className="text-destructive mb-2">{error}</p>
            <Button onClick={fetchReels} variant="outline" size="sm">
              Try Again
            </Button>
          </Card>
        ) : reels.length === 0 ? (
          <Card className="w-full max-w-md p-4 text-center">
            <p className="mb-2">No reels found. Create your first reel!</p>
            <Button variant="default" onClick={() => navigate("/camera")}>
              <Camera className="h-4 w-4 mr-2" />
              Create Reel
            </Button>
          </Card>
        ) : (
          <div
            ref={containerRef}
            className="relative flex-1 w-full overflow-y-auto snap-y snap-mandatory"
            style={{
              touchAction: "manipulation",
              scrollSnapType: "y mandatory",
            }}
          >
            {reels.map((reel, index) => (
              <div
                key={reel.id}
                data-reel-id={reel.id}
                className="reel-container w-full h-[calc(100vh-120px)] flex items-center justify-center snap-start snap-always"
                style={{ scrollSnapAlign: "start" }}
              >
                <div
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    showTooltip(reel.id);
                    navigate(`/camera`);
                  }}
                  className="w-full h-full max-w-md relative"
                >
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[index] = el;
                    }}
                    src={reel.video_url}
                    className="w-full h-full object-cover rounded-lg"
                    autoPlay
                    playsInline
                    loop
                    muted
                  />
                  <div className="absolute bottom-4 left-4 bg-background/70 px-3 py-1 rounded-full text-sm">
                    {reel.user_email.split("@")[0]}
                  </div>
                  {/* Play/Pause indicator - appears briefly on interaction */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className={`text-white text-sm bg-black/50 px-4 py-2 rounded-full transition-opacity duration-300 ${
                        activeTooltip === reel.id ? "opacity-80" : "opacity-0"
                      }`}
                    >
                      Double-tap to create
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Reels;

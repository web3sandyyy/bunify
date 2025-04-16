import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface Reel {
  id: number;
  user_email: string;
  video_url: string;
  uploaded_at: string;
}

interface ReelViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReel: Reel | null;
  onClose: () => void;
}

const ReelViewDialog = ({
  open,
  onOpenChange,
  selectedReel,
  onClose,
}: ReelViewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Viewing Reel</DialogTitle>
        </DialogHeader>

        {selectedReel && (
          <div className="relative bg-black rounded-md overflow-hidden aspect-[9/16] mx-auto">
            <video
              src={selectedReel.video_url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              loop
              playsInline
            />
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose} size="sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReelViewDialog;

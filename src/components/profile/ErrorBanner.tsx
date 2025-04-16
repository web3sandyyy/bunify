import { Button } from "../ui/button";

interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

const ErrorBanner = ({ error, onDismiss }: ErrorBannerProps) => {
  if (!error) return null;

  return (
    <div className="mb-4 bg-destructive/10 text-destructive p-3 rounded-md flex items-center justify-between">
      <span className="text-sm">{error}</span>
      <Button variant="ghost" size="sm" className="ml-2" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
};

export default ErrorBanner;

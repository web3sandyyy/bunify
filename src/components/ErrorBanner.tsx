import { X } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";

interface ErrorBannerProps {
  error: string;
  onDismiss?: () => void;
  actionButton?: React.ReactNode;
}

const ErrorBanner = ({
  error,
  onDismiss,
  actionButton = null,
}: ErrorBannerProps) => {
  return (
    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4 flex justify-between items-center">
      <div>
        <p className={actionButton ? "mb-2" : ""}>{error}</p>
        {actionButton}
      </div>
      {onDismiss && (
        <Button onClick={onDismiss} variant="ghost" size="sm">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ErrorBanner;
